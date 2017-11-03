/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:20:05 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-03 15:39:09
 */

class EventProxy {
  /**
   * Creates an instance of EventProxy.
   */
  constructor() {
    this.event = {};
  }
  /**
   * fire event
   * @param {string} evt 
   * @param {any} data 
   * @returns {undefined}
   */
  fire(evt, data) {
    let event = this.event[evt];
    if (!event) return;
    event.cbs.forEach(cb => {
      cb(data);
    })
  }
  /**
   * add event listener
   * @param {string} evt 
   * @param {function} cb 
   */
  on(evt, cb) {
    if (this.event[evt]) {
      this.event[evt].cbs.push(cb)
    } else {
      this.event[evt] = {
        evt: evt,
        cbs: [cb]
      }
    }
  }
}
module.exports = EventProxy;
