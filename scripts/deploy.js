const Client = require('ftp');
const glob = require('glob');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const config = require('./config');

const loading = ora();

const c = new Client();

const build_dir = path.resolve(__dirname, '../build').replace(/\\/g, '/');

const files = glob.sync(build_dir + '/**/*.*');

c.on('ready', async () => {
  loading.text = '清除缓存中';
  loading.start();
  try {
    await deleteAll(c, '/htdocs');
  } catch (error) {
    console.log(chalk.red(error));
    loading.fail('清除文件失败');
    process.exit(0);
  }
  loading.succeed('清除完成');

  loading.text = '开始上传文件';
  loading.start();
  try {
    await putAll(c, files);
  } catch (error) {
    console.log(chalk.red(error));
    loading.fail('上传文件失败');
    process.exit(0);
  }

  loading.succeed('上传完成');
  c.end();
});

async function main() {
  let answer = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: '请输入服务器密码:'
    }
  ]);
  const { password } = answer;
  if (!password) {
    process.exit(0);
  }
  c.connect({
    ...config,
    password
  });
}

main();

async function putAll(c, files) {
  try {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const server_path = file.replace(build_dir, '/htdocs');
      await putFile(c, file, server_path);
    }
  } catch (error) {
    console.error(error);
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
