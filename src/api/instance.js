import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://api.tianapi.com',
  timeout: 10000
});

instance.interceptors.request.use(function(config) {
  const { params = {} } = config;
  config.params = {
    ...params,
    key: '5e8fa776ff5d9dfef71c3882bbd98cf9'
  };
  return config;
});

instance.interceptors.response.use(function(response) {
  const { data } = response;
  const { code, msg } = data;
  if (code !== 200) {
    return Promise.reject(msg);
  }
  return data;
});

export default instance;
