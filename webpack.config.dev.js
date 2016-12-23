var path = require('path')
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')
var precss = require('precss')
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    "medit.min": './src/medit.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: [],
  resolve: {
    alias: {
      medit: path.resolve(__dirname, 'src')
    },
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'src')
        ]
      },
	  {	test   : /\.css$/, loaders: ['style-loader', 'css-loader', 'resolve-url-loader']},
      { test: /\.scss$/, loaders: ['style-loader', 'css-loader?modules&localIdentName=[local]-[hash:base64:5]', 'postcss-loader', 'sass-loader'] },
      { test: /\.(ttf|eot|woff|woff2|otf|svg)/, loader: 'file-loader?name=./font/[name].[ext]' },
      { test: /\.json$/, loader: 'file-loader?name=./json/[name].json' },
      { test: /\.(png|jpg|jpeg|gif)$/, loader: 'url-loader?limit=100000&name=./images/[name].[ext]' }
    ]
  },
  postcss: function () {
    return [autoprefixer({ browsers: ['> 1%', 'IE 9'] }), precss]
  },
  plugins: [
	  new CopyWebpackPlugin([{context:'./src/images/', from:'**/*', to:'images'}])
  ]
}