const { numberIsInRange } = require("../src/utils/utils");
const assert = require("assert");

const test = {
  range: [[0, 1], [10, 1]],
  number: 5
};
describe("numberIsInRange", () => {
  it("Test if a number is inside a range", () => {
    assert.deepEqual(numberIsInRange(test.number, test.range), true);
  });
});
