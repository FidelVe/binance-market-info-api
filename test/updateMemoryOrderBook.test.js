const { updateMemoryOrderBook, pairs } = require("../src/utils/utils");
const assert = require("assert");

const orderbook = {
  [pairs[0]]: {
    lastUpdateId: 1,
    bids: new Map([[20100, 10], [20200, 11]]),
    asks: new Map([[20300, 10], [20400, 11]])
  },
  [pairs[1]]: {
    lastUpdateId: 1,
    bids: new Map([[1500, 10], [1510, 11]]),
    asks: new Map([[1520, 10], [1530, 11]])
  },
  [pairs[2]]: {
    lastUpdateId: 1,
    bids: new Map([[230, 10], [325, 11]]),
    asks: new Map([[240, 10], [245, 11]])
  }
};
const stream1 = {
  stream: "btcusdt@depth",
  data: {
    e: null,
    E: null,
    U: 100,
    u: 200,
    b: [[20100, 5], [20200, 5]],
    a: [[20300, 5], [20400, 5]]
  }
};

const result = {
  [pairs[0]]: {
    lastUpdateId: 200,
    bids: new Map([[20100, 5], [20200, 5]]),
    asks: new Map([[20300, 5], [20400, 5]])
  },
  [pairs[1]]: { ...orderbook[pairs[1]] },
  [pairs[2]]: { ...orderbook[pairs[2]] }
};

describe("updateMemoryOrderBook", () => {
  it("updates an orderbook", () => {
    assert.deepEqual(updateMemoryOrderBook(orderbook, stream1), result);
  });
});
