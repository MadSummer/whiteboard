const expect = require('chai').expect;
const tools = require('../src/tools');
describe('tools', () => {
  describe('isArray', () => {
    it('[1,2,3] should be array', () => {
      expect(tools.isArray([1, 2, 3])).to.be.equal(true);
    });
    it('{1:1,2:2,3:3,length:3} should not be array', () => {
      expect(tools.isArray({
        1: 1,
        2: 2,
        3: 3,
        length: 3
      })).to.be.equal(false);
    });
  });
})