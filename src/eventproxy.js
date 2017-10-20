/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:20:05 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-10-20 15:41:30
 */
class EventProxy {
  /**
   * Creates an instance of EventProxy.
   * @memberof EventProxy
   */
  constructor() {
    this.event = {};
  }
  /**
   * 
   * 
   * @param {string} evt 
   * @param {any} data 
   * @returns 
   * @memberof EventProxy
   */
  fire(evt, data) {
    let event = this.event[evt];
    if (!event) return;
    event.cbs.forEach(cb => {
      cb(data);
    })
  }
  /**
   * 
   * 
   * @param {string} evt 
   * @param {function} cb 
   * @memberof EventProxy
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