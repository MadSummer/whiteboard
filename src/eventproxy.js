function EventProxy() {
  this.event = {};
};
EventProxy.prototype = {
  fire: function (evt, data) {
    let event = this.event[evt];
    if (!event instanceof Array) return;
    event.cbs.forEach(cb => {
      cb(data)
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