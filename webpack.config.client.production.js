const path = require('path');

const CURRENT_WORKING_DIR = process.cwd();

const config = {
  name: 'browser',
  mode: 'production',
  entry: path.join(CURRENT_WORKING_DIR, 'client/main.tsx'),
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: 'bundle.js',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)?(x)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};

module.exports = config;
