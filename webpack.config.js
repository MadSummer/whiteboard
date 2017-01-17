module.exports = {
  watch: false,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
    ],
  },
  output: {
    path: __dirname,
    filename: 'index.js'
  },
  resolve: {
    // alias: {
    //   'vue$': 'vue/dist/vue.common.js'
    // }
  }
}