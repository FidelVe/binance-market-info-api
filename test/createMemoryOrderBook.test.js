const { createMemoryOrderBook } = require("../src/utils/utils");
const assert = require("assert");

const queryResponse = {
  lastUpdateId: 1,
  bids: [[20, 10], [21, 9]],
  asks: [[21, 11], [22, 8]]
};

const result = {
  lastUpdateId: 1,
  bids: new Map([[20, 10], [21, 9]]),
  asks: new Map([[21, 11], [22, 8]])
};

describe("createMemoryOrderBook", () => {
  it("creates an orderbook", () => {
    assert.deepEqual(createMemoryOrderBook(queryResponse), result);
  });
});
