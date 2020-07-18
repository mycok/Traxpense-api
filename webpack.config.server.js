const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

const CURRENT_WORKING_DIR = process.cwd();

const config = {
  name: 'server',
  target: 'node',
  entry: path.join(CURRENT_WORKING_DIR, './server/index.ts'),
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist/server'),
    filename: 'server.generated.js',
    publicPath: '/dist/',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  plugins: [new Dotenv()],
};

module.exports = config;
