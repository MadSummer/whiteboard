/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:20:05 
 * @Last Modified by:   Liu Jing 
 * @Last Modified time: 2017-10-18 11:20:05 
 */
function EventProxy() {
  this.event = {};
};
EventProxy.prototype = {
  fire: function (evt, data) {
    let event = this.event[evt];
    if (!event) return;
    event.cbs.forEach(cb => {
      cb(data);
    })
  },
  on: function (evt, cb) {
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