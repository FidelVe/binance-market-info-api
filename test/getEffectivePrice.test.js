const { getEffectivePrice, pairs } = require("../src/utils/utils");
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
const paramsForTest = {
  buy: {
    result: (
      350 /
      ((350 -
        (20295.13 * 0.00934 +
          20295.14 * 0.00108 +
          20295.18 * 0.00057 +
          20295.33 * 0.00246)) /
        20295.7 +
        (0.00934 + 0.00108 + 0.00057 + 0.00246))
    ).toFixed(6),
    operationType: "buy",
    operationAmount: 350
  },
  sell: {
    result: (20302.95).toFixed(6),
    operationType: "sell",
    operationAmount: 350
  }
};

describe("getEffectivePrice - testing a buy order", () => {
  it("It gets the effective price of an order depending on the amount of the base unit in the pair (for this test the base unit is 'usdt' and the pair is 'btcusdt'", () => {
    assert.deepEqual(
      getEffectivePrice(
        orderbook,
        pairs[0],
        paramsForTest.buy.operationType,
        paramsForTest.buy.operationAmount
      ).toFixed(6),
      paramsForTest.buy.result
    );
  });
});

describe("getEffectivePrice - testing a sell order", () => {
  it("It gets the effective price of an order depending on the amount of the base unit in the pair (for this test the base unit is 'usdt' and the pair is 'btcusdt'", () => {
    assert.deepEqual(
      getEffectivePrice(
        orderbook,
        pairs[0],
        paramsForTest.sell.operationType,
        paramsForTest.sell.operationAmount
      ).toFixed(6),
      paramsForTest.sell.result
    );
  });
});
