'use strict';

let path = require('path');

module.exports = {
  entry: {
    'content-script': './src/content-script',
    'bgworker': './src/bgworker',
    'popup': './src/popup',
    'view-log': './src/view-log'
  },

  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js'
  },
};
