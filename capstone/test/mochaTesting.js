const assert = require('chai').assert;
const flags_script = require('../src/main/webapp/flags_script.js');

describe('flags_script.js', () => {
  describe('flags_script.js', () => {
      it('testing isPlaceClose function returns true when two points are close', () => {
          const result = flags_script.isPlaceClose(33.703072, -117.794583, 33.706303, -117.796900);
          assert.strictEqual(result, true);
      })
      it('testing isPlaceClose function returns false when two points are far', () => {
          const result = flags_script.isPlaceClose(33.703072, -117.794583, 33.798983, -117.150000);
          assert.strictEqual(result, false);
      })
  })
});
