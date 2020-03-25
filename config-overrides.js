const path = require('path');
const {
  override,
  addWebpackAlias,
  addWebpackPlugin
} = require('customize-cra');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = override(
  addWebpackAlias({
    '@@': path.resolve(__dirname, './src')
  }),
  addWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ['markdown']
    })
  )
);
