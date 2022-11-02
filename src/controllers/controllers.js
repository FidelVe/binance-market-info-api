/**
 * route: /api/v1/pairs
 */
const getPair = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs'");
  res.end();
};

/**
 * route: /api/v1/pairs/:pair
 */
const getPairs = async (req, res) => {
  //
  console.log("request to '/api/v1/pairs/:pair'");
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
