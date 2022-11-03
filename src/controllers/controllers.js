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
  console.log(
    "request to '/api/v1/eff-price/:pairName-:opType-:amount?limit=<LIMIT>'"
  );
  res.set("Connection", "close").status(200);
  const response = {
    result: null
  };

  let paramsAreCorrect = true;

  // if req.params.amount is not a number return an error message
  if (Number.isNaN(Number(req.params.amount))) {
    paramsAreCorrect = false;
    response.result = `Param 'amount' received invalid type: it should be a number, value received was '${req.params.amount}'`;
  }

  // if req.params.opType is not 'buy' or 'sell' return an error message.
  if (!["buy", "sell"].includes(req.params.opType.toLowerCase())) {
    paramsAreCorrect = false;
    response.result = `Param 'opType' received invalid type: it should be either 'buy' or 'sell', value received was '${req.params.opType}'`;
  }

  // if req.params.pairName is not in the list of supported pairs
  // return an error message.
  if (!utils.pairs.includes(req.params.pairName.toLowerCase())) {
    paramsAreCorrect = false;
    response.result = `Param 'pairName' received invalid type: it should be one of ${utils.pairs}, value received was '${req.params.pairName}'`;
  }

  // if the request has a 'limit' as a query param, like in the following
  // example:
  // - /api/v1/eff-price/:pairName-:opType-:amount?limit=<LIMIT>
  if (
    Object.keys(req.query).includes("limit") &&
    Number.isNaN(Number(req.query.limit))
  ) {
    paramsAreCorrect = false;
    response.result = `Query  param 'limit' received invalid type: received '${req.query.limit}' and value should be of type 'Number'`;
  }

  // if req.params types are all correct
  if (paramsAreCorrect === true) {
    const copyOfOrderBook = utils.copyOrderBook(req.inMemoryOrderBook);
    if (Object.keys(req.query).includes("limit")) {
      const maxOrderSize = utils.getMaxOrderSize(
        copyOfOrderBook,
        req.params.pairName,
        req.params.opType,
        req.query.limit
      );

      if (maxOrderSize == null) {
        response.result = "Order query outside of range of current orderbook";
      } else {
        response.result = maxOrderSize;
      }
    } else {
      const effPrice = utils.getEffectivePrice(
        copyOfOrderBook,
        req.params.pairName,
        req.params.opType,
        req.params.amount
      );
      response.result = effPrice;
    }
  }
  // response
  res.json(response);
  res.end();
};

module.exports = {
  getPair,
  getPairs,
  getEffPrice
};
