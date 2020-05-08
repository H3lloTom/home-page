const Client = require('ftp');
const glob = require('glob');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const ProgressBar = require('progress');
const config = require('./config');

const loading = ora();

const c = new Client();

const build_dir = path.resolve(__dirname, '../build').replace(/\\/g, '/');

const files = glob.sync(build_dir + '/index.html');

c.on('ready', async () => {
  loading.text = '清除缓存中';
  loading.start();
  try {
    await deleteAll(c, '/htdocs');
  } catch (error) {
    loading.fail('清除文件失败');
    console.log(error);
    process.exit(0);
  }
  loading.succeed('清除完成');
  try {
    await putAll(c, files);
  } catch (error) {
    loading.fail('上传文件失败');
    console.log(error);
    process.exit(0);
  }

  loading.succeed('上传完成');
  c.end();
});

async function main() {
  // let answer = await inquirer.prompt([
  //   {
  //     type: 'password',
  //     name: 'password',
  //     message: '请输入服务器密码:'
  //   }
  // ]);
  // const { password } = answer;
  // if (!password) {
  //   process.exit(0);
  // }
  c.connect({
    ...config,
    password:'xyq52099.'
  });
}

main();

async function putAll(c, files) {
  const bar = new ProgressBar('上传中 [:bar] :current/:total :percent', {
    incomplete: ' ',
    width: 20,
    total: files.length
  });
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const server_path = file.replace(build_dir, '/htdocs');
    await putFile(c, file, server_path);
    bar.tick();
  }
}

async function deleteAll(c, dirName, cb) {
  try {
    let list = await listFile(c, dirName);
    for (let index = 0; index < list.length; index++) {
      const file = list[index];
      if (file.name === 'logreport') {
        continue;
      }
      if (file.type === 'd') {
        return await deleteAll(c, dirName + '/' + file.name);
      }
      await deleteFile(c, dirName + '/' + file.name);
    }
    if (cb) cb();
    return;
  } catch (error) {
    console.error(error);
  }
}

function deleteFile(c, path) {
  return new Promise((s, j) => {
    c.delete(path, err => {
      if (err) return j(err);
      s();
    });
  });
}

function putFile(c, path, server_path) {
  return new Promise((s, j) => {
    c.put(path, server_path, err => {
      if (err) return j(err);
      s();
    });
  });
}

function listFile(c, path) {
  return new Promise((s, j) => {
    c.list(path, (err, list) => {
      if (err) return j(err);
      s(list);
    });
  });
}
