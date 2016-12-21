var webpack = require('webpack')
var config = require('./webpack.config.dev.js')
var compiler = webpack(config);
compiler();
