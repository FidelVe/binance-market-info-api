const { getMaxOrderSize, pairs } = require("../src/utils/utils");
const assert = require("assert");

const orderbook = {
  [pairs[0]]: {
    lastUpdateId: 1,
    bids: [
      ["20302.95000000", "0.12896000"],
      ["20302.67000000", "0.09830000"],
      ["20302.62000000", "0.08689000"],
      ["20302.53000000", "0.00519000"],
      ["20302.52000000", "0.00107000"],
      ["20302.51000000", "0.00061000"]
    ],
    asks: [
      ["20295.13000000", "0.00934000"],
      ["20295.14000000", "0.00108000"],
      ["20295.18000000", "0.00057000"],
      ["20295.33000000", "0.00246000"],
      ["20295.70000000", "0.01309000"],
      ["20295.71000000", "0.01911000"]
    ]
  }
};
const paramsForTest1 = {
  buy: {
    result: null,
    operationType: "buy",
    operationAmount: 350
  },
  sell: {
    result: null,
    operationType: "sell",
    operationAmount: 350
  }
};
const paramsForTest2 = {
  buy: {
    result: (
      (((20295.13 * 0.00934 +
        20295.14 * 0.00108 +
        20295.18 * 0.00057 +
        20295.33 * 0.00246) /
        (0.00934 + 0.00108 + 0.00057 + 0.00246)) *
        (0.00934 + 0.00108 + 0.00057 + 0.00246) -
        20295.19 * (0.00934 + 0.00108 + 0.00057 + 0.00246)) /
        (20295.19 - 20295.7) +
      (0.00934 + 0.00108 + 0.00057 + 0.00246)
    ).toFixed(6),
    operationType: "buy",
    operationAmount: 20295.19
  },
  sell: {
    result: (0.13888).toFixed(6),
    operationType: "sell",
    operationAmount: 20302.93
  }
};

describe("getMaxOrderSize- testing a buy order outside of orderbook range", () => {
  it("Retrieves the maximum order size with the given 'limit' value in base unit", () => {
    assert.deepEqual(
      getMaxOrderSize(
        orderbook,
        pairs[0],
        paramsForTest1.buy.operationType,
        paramsForTest1.buy.operationAmount
      ),
      paramsForTest1.buy.result
    );
  });
});

describe("getMaxOrderSize- testing a sell order outside of orderbook range", () => {
  it("Retrieves the maximum order size with the given 'limit' value in base unit", () => {
    assert.deepEqual(
      getMaxOrderSize(
        orderbook,
        pairs[0],
        paramsForTest1.sell.operationType,
        paramsForTest1.sell.operationAmount
      ),
      paramsForTest1.sell.result
    );
  });
});

describe("getMaxOrderSize- testing a buy order inside of orderbook range", () => {
  it("Retrieves the maximum order size with the given 'limit' value in base unit", () => {
    assert.deepEqual(
      getMaxOrderSize(
        orderbook,
        pairs[0],
        paramsForTest2.buy.operationType,
        paramsForTest2.buy.operationAmount
      ).toFixed(6),
      paramsForTest2.buy.result
    );
  });
});

describe("getMaxOrderSize- testing a sell order inside of orderbook range", () => {
  it("Retrieves the maximum order size with the given 'limit' value in base unit", () => {
    assert.deepEqual(
      getMaxOrderSize(
        orderbook,
        pairs[0],
        paramsForTest2.sell.operationType,
        paramsForTest2.sell.operationAmount
      ).toFixed(6),
      paramsForTest2.sell.result
    );
  });
});
