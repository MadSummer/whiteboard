const path = require('path');
const http = require('http');
module.exports = {
  entry: './src/canvas.js',
  watch: false,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ["es2015"],
          plugins: ["transform-class-properties"]
        }
      }
    }]
  },
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'whiteboard.js'
  },
  devServer: {
    open: true,
    disableHostCheck: true,
    host: '192.168.1.38',
    inline: true,
    watchContentBase: true,
    //useLocalIp: true,
    hot: true,
    contentBase: path.join(__dirname, '/app/'),
    publicPath: './app/public/',
    compress: false,
    port: 3000
  }
}