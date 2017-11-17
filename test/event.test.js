const expect = require('chai').expect;
const ep = new (require('../src/eventproxy'));
let tmp = 0;
describe('eventproxy', function () {
  describe('on', function () {
    it('should add a new listener ', function () {
      ep.on('test', function testListener(data) {
        tmp += data;
      });
      expect(ep.event.test.cbs[0].name).to.be.equal('testListener');
    });
    it('should have five listeners', function () {
      let i = 0;
      while (i < 4) {
        ep.on('test', data => {
          tmp += data;
        });
        i++;
      }
      expect(ep.event.test.cbs.length).to.be.equal(5);
    });
  });
  describe('fire', function () {
    it(`fire test event,tmp should be ${666*5}`, function () {
      ep.fire('test', 666);
      expect(tmp).to.be.eq(666 * 5);
    });
  });
});