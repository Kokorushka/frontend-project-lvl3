const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader',
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    ],
  },

  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
};
