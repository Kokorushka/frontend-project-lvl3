const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  plugins: [new webpack.ProgressPlugin()],

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader'
    },
     {
       test: /\.css$/,
       use: ['style-loader', 'css-loader']
     }
    // {
    //   test: /\.(scss)$/,
    //   use: [{
    //     loader: 'style-loader', // inject CSS to page
    //   }, {
    //     loader: 'css-loader', // translates CSS into CommonJS modules
    //   }, {
    //     loader: 'postcss-loader', // Run post css actions
    //     options: {
    //       plugins: function () { // post css plugins, can be exported to postcss.config.js
    //         return [
    //           require('precss'),
    //           require('autoprefixer')
    //         ];
    //       }
    //     }
    //   }, {
    //     loader: 'sass-loader' // compiles Sass to CSS
    //   }]
    // },
   ]
  },

  devServer: {
    open: true,
    host: 'localhost'
  },
   plugins: [
     new HtmlWebpackPlugin({
       template: 'template.html',
     }),
   ],
}