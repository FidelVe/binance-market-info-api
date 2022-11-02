const utils = require("../utils/utils");

/**
 * route: /api/v1/pairs/:pairs
 */
const getPair = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs/:pair'");

  res.set("Connection", "close").status(200);
  const response = {
    result: null
  };

  if (utils.pairs.includes(req.params.pair)) {
    const copyOfOrderBook = utils.copyOrderBook(req.inMemoryOrderBook);
    const topOrders = utils.getTopOrders(copyOfOrderBook);
    response.result = {
      bids: topOrders[req.params.pair].bids,
      asks: topOrders[req.params.pair].asks
    };
  } else {
    response.result = `Pair "${req.params.pair}" unsupported`;
  }
  console.log(req.params);

  // response
  res.json(response);
  res.end();
};

/**
 * route: /api/v1/pairs
 */
const getPairs = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs'");
  res.set("Connection", "close").status(200);

  // response
  res.json({
    result: utils.pairs
  });
  res.end();
};

/**
 * route: /api/v1/eff-price/:pairName-:opType-:amount?limit=<LIMIT>
 */
const getEffPrice = async (req, res) => {
  //
  console.log("request to '/api/v1/eff-price/:pairName-:opType-:amount'");
  res.end();
};

module.exports = {
  getPair,
  getPairs,
  getEffPrice
};
