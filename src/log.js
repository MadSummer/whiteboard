/*
 * @Author: Liu Jing 
 * @Date: 2017-10-23 10:06:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-06 14:54:52
 */
class Logger{
  /**
   * Creates an instance of Logger.
   * @param {boolean} [debug=true] 
   */
  constructor(debug = true) {
    this.debugMode = debug;
  }
  /**
   * 
   * debug out
   * @returns {undefined}
   */
  debug() {
    if (!this.debugMode) return;
    console.debug.apply(console, arguments);
  }
  /**
   * 
   * error out
   * @returns {undefined}
   */
  error() {
    if (!this.debugMode) return;
    if (!this.debugMode) return;
    console.error.apply(console, arguments);
  }
  /**
   * info out
   * @returns {undefined}
   */
  info() {
    if (!this.debugMode) return;
    console.info.apply(console, arguments);
  }
  /**
   * log out
   * @returns {undefined}
   */
  log() {
    if (!this.debugMode) return;
    console.log.apply(console, arguments);
  }
/**
 * 
 * 
 */
warn() {
  if (!this.debugMode) return;
  console.warn.apply(console, arguments);
  }
  /**
   * 
   * set debug model
   * @param {boolean} [debugMode=true] 
   * @memberof Logger
   */
  setMode(debugMode = true) {
    this.debugMode = !!debugMode;
  }
}
module.exports = Logger;