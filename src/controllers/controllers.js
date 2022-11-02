const utils = require("../utils/utils");

/**
 * route: /api/v1/pairs
 */
const getPair = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs/:pair'");
  res.set("Connection", "close").status(200);

  // response
  res.json({
    result: utils.pairs
  });
  res.end();
};

/**
 * route: /api/v1/pairs/:pair
 */
const getPairs = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs'");
  console.log("inMemoryOrderBook");
  const copyOfOrderBook = utils.copyOrderBook(req.inMemoryOrderBook);
  const topOrders = utils.getTopOrders(copyOfOrderBook);
  console.log(topOrders);
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
