/*
 * @Author: Liu Jing 
 * @Date: 2017-10-23 10:06:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-10-23 10:08:33
 */
module.exports = class Logger{
  constructor(debug = true) {
    this.debugMode = debug;
  }
  debug() {
    if (!this.debugMode) return;
    console.debug.apply(console, arguments);
  }
  error() {
    if (!this.debugMode) return;
    if (!this.debugMode) return;
    console.error.apply(console, arguments);
  }
  info() {
    if (!this.debugMode) return;
    console.info.apply(console, arguments);
  }
  log() {
    if (!this.debugMode) return;
    console.log.apply(console, arguments);
  }
  /**
   * 
   * set debug mode
   * @param {boolean} debugMode 
   */
  setMode(debugMode) {
    this.debugMode = !!debugMode;
  }
}