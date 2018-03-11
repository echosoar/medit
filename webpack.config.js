const webpack = require('webpack');
const sassLintPlugin = require('sasslint-webpack-plugin');
const I18nPlugin = require('i18n-webpack-plugin');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const isDev = process.env.NODE_ENV !== 'production';
const entry = './src/index.js';

const plugins = isDev ? [
  new sassLintPlugin({
    glob: 'src/**/*.sass',
    configFile: '.sass-lint.yml',
  })
] : [];



if (!isDev) {
  let newVersion = childProcess.execSync('git symbolic-ref HEAD').toString().replace(/^.*?(\d+\.\d+\.\d+)[.\s]*/g, '$1');
  let pkgAddr = `${__dirname}/package.json`;
  let pkgData = fs.readFileSync(pkgAddr);
  pkgData = (pkgData + '').replace(/"version":\s"(\d+\.\d+\.\d+)"/, '"version": "' + newVersion + '"');
  fs.writeFileSync(pkgAddr, pkgData);
  console.log('Update version to :' + newVersion);
}

const config = {
  entry,
  plugins,
  cache: isDev,
  devtool: isDev ? 'cheap-module-source-map' : 'none',

  output: {
    path: `${__dirname}/build/`,
    filename: '[name].js'
  },

  resolve: {
    alias: {
      _: `${__dirname}/src/`
    },
    modules: [`${__dirname}/src/`, 'node_modules'],
    extensions: ['.js']
  },

  module: {
    rules: [
      { test: /\.js$/, loaders: isDev ? ['babel-loader'] : ['babel-loader']},
      {	test: /\.css$/, loaders: ['style-loader', 'css-loader?modules&localIdentName=[name]__[local]-[hash:base64:5]', 'postcss-loader']},
      {	test: /\.less$/, loaders: ['style-loader', 'css-loader?modules&localIdentName=[name]__[local]-[hash:base64:5]', 'postcss-loader', 'less-loader']},
      { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'] },
      { test: /\.(ttf|eot|woff|woff2|otf|svg)/, loader: 'file-loader?name=./font/[name].[ext]' },
      { test: /\.json$/, loader: 'file-loader?name=./json/[name].json' }
    ]
  }
};

module.exports = config;