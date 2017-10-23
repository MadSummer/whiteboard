const path = require('path');
const config = require('./config');
module.exports = {
  entry: [ /*'babel-polyfill',*/ './src/whiteboard.js'],
  watch: true,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              targets: {
                browsers: ['IE >= 9', 'Android >= 4.4','iOS >= 9']
              },
              debug:true
            }]
          ],
          plugins: ['transform-class-properties']
        }
      }
    }]
  },
  output: {
    path: path.join(__dirname, '/app/dist/'),
    filename: 'whiteboard.js',
    publicPath: path.join(__dirname, '/app/dist/')
  },
  devServer: {
    open: true,
    //openPage:'app/index.html',
    disableHostCheck: true,
    host: config.host,
    inline: true,
    watchContentBase: true,
    //useLocalIp: true,
    hot: true,
    contentBase: path.join(__dirname + '/app'),
    publicPath: './app/public/',
    compress: false,
    port: config.port,
    publicPath: path.join(__dirname, '/app/dist/')
  }
}