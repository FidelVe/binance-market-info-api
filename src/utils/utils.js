// Variables
const pairs = ["btcusdt", "ethusdt", "bnbusdt"];

const pairInitState = {
  lastUpdateId: null,
  bids: [],
  asks: []
};

const orderBookInitState = {
  [pairs[0]]: { ...pairInitState },
  [pairs[1]]: { ...pairInitState },
  [pairs[2]]: { ...pairInitState }
};

const wsStringMulti = `wss://stream.binance.com:9443/stream?streams=${pairs[0].toLowerCase()}@depth/${pairs[1].toLowerCase()}@depth/${pairs[2].toLowerCase()}@depth`;

/**
 * creates a blank orderbook
 */
function getOrderBookInitState() {
  return {
    [pairs[0]]: { ...pairInitState },
    [pairs[1]]: { ...pairInitState },
    [pairs[2]]: { ...pairInitState }
  };
}

/**
 * Takes a response from a query to the binance API in the following
 * format:
 *  - /api/v3/depth?symbol=<SYMBOL>&limit=1000
 *
 * returns a formatted orderbook using Maps
 * @param {Object} queryResponse - API response
 */
function createMemoryOrderBook(queryResponse) {
  const result = {
    lastUpdateId: null,
    bids: new Map(),
    asks: new Map()
  };
  // lastUsedIndex is a control variable to reduce amount of iterations
  let lastUsedIndex = 0;
  result.lastUpdateId = queryResponse.lastUpdateId;

  // we want to iterate over the smaller of the two.
  if (queryResponse.bids.length >= queryResponse.asks.length) {
    // if the size of bids is bigger (or equal) to the size of the ask
    queryResponse.asks.forEach((bookEntry, index) => {
      // while iterating over the smaller of the two, we populate both the
      // bid and ask Maps
      result.asks.set(bookEntry[0], bookEntry[1]);
      result.bids.set(
        queryResponse.bids[index][0],
        queryResponse.bids[index][1]
      );
      lastUsedIndex = index;
    });

    if (lastUsedIndex < queryResponse.bids.length - 1) {
      for (let i = lastUsedIndex + 1; i <= queryResponse.bids.length - 1; i++) {
        // continue with the rest of the bids
        result.bids.set(queryResponse.bids[i][0], queryResponse.bids[i][1]);
      }
    }
  } else {
    // if the size of asks is bigger than the size of the bids
    queryResponse.bids.forEach((bookEntry, index) => {
      // while iterating over the smaller of the two, we populate both the
      // bid and ask Maps
      result.bids.set(bookEntry[0], bookEntry[1]);
      result.asks.set(
        queryResponse.asks[index][0],
        queryResponse.asks[index][1]
      );
      lastUsedIndex = index;
    });

    if (lastUsedIndex < queryResponse.asks.length - 1) {
      for (let i = lastUsedIndex + 1; i <= queryResponse.asks.length - 1; i++) {
        // continue with the rest of the asks
        result.asks.set(queryResponse.asks[i][0], queryResponse.asks[i][1]);
      }
    }
  }

  return result;
}

/**
 * Updates a Map orderbook with the websocket response of the update of
 * said orderbook.
 * TODO: to optimize, the function can be designed as an
 * impure function, this means instead of copying the Maps inside the
 * orderbook, we directly modify the orderbook variable which resides
 * outside the local scope.
 * @param {Object} orderbook - original orderbook
 * @param {Object} diff - update in the orderbook
 */
function updateMemoryOrderBook(orderbook, diff) {
  const newOrderBook = {};
  let doUpdate = false;
  const stream = diff.stream.toLowerCase();
  const strings = {
    asks: {
      short: "a",
      long: "asks"
    },
    bids: {
      short: "b",
      long: "bids"
    }
  };
  let shortLabelMain = strings.bids.short;
  let shortLabelSub = strings.asks.short;
  let longLabelMain = strings.bids.long;
  let longLabelSub = strings.asks.long;

  pairs.forEach(pair => {
    newOrderBook[pair] = {
      lastUpdateId: orderbook[pair].lastUpdateId,
      bids: new Map(orderbook[pair].bids),
      asks: new Map(orderbook[pair].asks)
    };
  });
  // updating orderBookInitState
  for (let i = 0; i <= pairs.length - 1; i++) {
    if (stream.includes(pairs[i].toLowerCase())) {
      //
      // if the lastUpdateId of the pair in the book is not null
      if (newOrderBook[pairs[i]].lastUpdateId != null) {
        //
        // if diff.data.u is higher, then the new websocket message is
        // more recent then the lastest update in the memory order book
        if (diff.data.u > newOrderBook[pairs[i]].lastUpdateId) {
          doUpdate = true;
          newOrderBook[pairs[i]].lastUpdateId = diff.data.u;

          let lastUsedIndex = 0;

          if (diff.data.b.length >= diff.data.a.length) {
            shortLabelMain = strings.asks.short;
            shortLabelSub = strings.bids.short;
            longLabelMain = strings.asks.long;
            longLabelSub = strings.bids.long;
          }

          diff.data[shortLabelMain].forEach((bookEntry, index) => {
            newOrderBook[pairs[i]][longLabelMain].set(
              bookEntry[0],
              bookEntry[1]
            );
            newOrderBook[pairs[i]][longLabelSub].set(
              diff.data[shortLabelSub][index][0],
              diff.data[shortLabelSub][index][1]
            );

            lastUsedIndex = index;

            // if any entry in the update is equal to zero
            // remove the entry
            if (bookEntry[1] === "0.00000000") {
              newOrderBook[pairs[i]][longLabelMain].delete(bookEntry[0]);
            }
            if (diff.data[shortLabelSub][index][1] === "0.00000000") {
              newOrderBook[pairs[i]][longLabelSub].delete(
                diff.data[shortLabelSub][index][0]
              );
            }
          });

          // TODO: write comment here
          if (lastUsedIndex < diff.data[shortLabelSub].length - 1) {
            for (
              let ii = lastUsedIndex + 1;
              ii <= diff.data[shortLabelSub].length - 1;
              ii++
            ) {
              //
              newOrderBook[pairs[i]][longLabelSub].set(
                diff.data[shortLabelSub][ii][0],
                diff.data[shortLabelSub][ii][1]
              );
            }
          }
        }
      }
      break;
    }
  }

  if (doUpdate === true) {
    return newOrderBook;
  } else {
    return null;
  }
}

/**
 * gets the top orders (size of orderLength) of the in-memory orderbook
 * @param {Object} orderbook - in-memory orderbook
 * @param {number} orderLength - size or orders to return
 * @param {null | string} onlyPair - if the param is a supported pair the
 * function will only sort that pair
 */
function getTopOrders(orderbook, orderLength = 5, onlyPair = null) {
  const topOrderBooks = getOrderBookInitState();
  const sortedOrderbook = sortOrderBook(orderbook);

  if (onlyPair == null) {
    pairs.forEach(pair => {
      topOrderBooks[pair].bids = JSON.stringify(
        sortedOrderbook[pair].bids.slice(0, orderLength)
      );
      topOrderBooks[pair].asks = JSON.stringify(
        sortedOrderbook[pair].asks.slice(0, orderLength)
      );
    });
  } else {
    if (pairs.includes(onlyPair)) {
      topOrderBooks[onlyPair].bids = JSON.stringify(
        sortedOrderbook[onlyPair].bids.slice(0, orderLength)
      );
      topOrderBooks[onlyPair].asks = JSON.stringify(
        sortedOrderbook[onlyPair].asks.slice(0, orderLength)
      );
    } else {
      // if the value of onlyPair is not a supported pair inside the
      // pairs array
      throw new Error(`unsupported pair: "${onlyPair}`);
    }
  }
  return topOrderBooks;
}

/**
 * sorts an orderbook
 * @param {Object} orderbook - orderbook to sort
 * @param {null | string} onlyPair - if the param is a supported pair the
 * function will only sort that pair
 */
function sortOrderBook(orderbook, onlyPair = null) {
  const sortedOrderBook = getOrderBookInitState();

  if (onlyPair == null) {
    pairs.forEach(pair => {
      sortedOrderBook[pair].bids = [...orderbook[pair].bids].sort(
        sortHighToLow
      );
      sortedOrderBook[pair].asks = [...orderbook[pair].asks].sort(
        sortLowToHigh
      );
    });
  } else {
    if (pairs.includes(onlyPair)) {
      sortedOrderBook[onlyPair].bids = [...orderbook[onlyPair].bids].sort(
        sortHighToLow
      );
      sortedOrderBook[onlyPair].asks = [...orderbook[onlyPair].asks].sort(
        sortLowToHigh
      );
    } else {
      // if the value of onlyPair is not a supported pair inside the
      // pairs array
      throw new Error(`unsupported pair: "${onlyPair}`);
    }
  }

  return sortedOrderBook;
}

/**
 * custom sort
 */
function sortHighToLow(a, b) {
  return Number(b[0]) - Number(a[0]);
}

/**
 * custom sort
 */
function sortLowToHigh(a, b) {
  return Number(a[0]) - Number(b[0]);
}

/**
 * function to make a copy with new Maps of the orderbook
 * @param {object} orderbook - orderbook
 */
function copyOrderBook(orderbook) {
  const copyOfOrderBook = {};
  pairs.forEach(pair => {
    copyOfOrderBook[pair] = {
      lastUpdateId: orderbook[pair].lastUpdateId,
      bids: new Map(orderbook[pair].bids),
      asks: new Map(orderbook[pair].asks)
    };
  });

  return copyOfOrderBook;
}

/**
 * Returns the effective price of a query when pair, amount and type
 * is given
 * @param {Object} orderbook - orderbook
 * @param {string} pair - should be one of the strings inside the pairs var
 * @param {string} type - should either be "buy" or "sell"
 * @param {number} amount - should be a number or a string that can be
 * converted into a number with Number(amount)
 */
function getEffectivePrice(orderbook, pair, type, amount) {
  //
  const sortedOrderbook = sortOrderBook(orderbook, pair);
  let rollingAmount = 0;
  let rollingOrders = 0;
  const amountInNumber = Number(amount);

  // get the list of asks or bids depending on the type param.
  // this operation defaults to the bids list if type != "buy"
  const orderList =
    type === "buy" ? sortedOrderbook[pair].asks : sortedOrderbook[pair].bids;

  for (const entry of orderList) {
    const price = Number(entry[0]);
    const orders = Number(entry[1]);

    if (price * orders <= amountInNumber - rollingAmount) {
      rollingAmount += price * orders;
      rollingOrders += orders;
    } else {
      rollingOrders += (amountInNumber - rollingAmount) / price;
      break;
    }
  }

  const effPrice = amountInNumber / rollingOrders;
  return effPrice;
}

/**
 * check if a number is inside a defined range.
 * @param {number} number - the number to check
 * @param {array[]} range - the range to check
 * @return {bool}
 */
function numberIsInRange(number, range) {
  let maxAmountInRange = null;
  let minAmountInRange = null;
  const numberParsed = Number(number);

  if (Number(range[range.length - 1][0]) - Number(range[0][0]) > 0) {
    maxAmountInRange = Number(range[range.length - 1][0]);
    minAmountInRange = Number(range[0][0]);
  } else {
    maxAmountInRange = Number(range[0][0]);
    minAmountInRange = Number(range[range.length - 1][0]);
  }

  if (numberParsed <= maxAmountInRange && numberParsed >= minAmountInRange) {
    return true;
  } else {
    return false;
  }
}

/**
 * Returns the max order size possible in an orderbook from a
 * pair (ie: btcusdt), a type of operation ('buy' or 'sell') and a given
 * limit size for the operation.
 * @param {object} orderbook - the orderbook
 * @param {pair} string - the pair to consult
 * @param {type} string - either 'buy' or 'sell'
 * @param {number} limit - limit size for the order
 */
function getMaxOrderSize(orderbook, pair, type, limit) {
  const sortedOrderbook = sortOrderBook(orderbook, pair);
  let rollingPrice = 0;
  let rollingOrders = 0;
  const limitInNumber = Number(limit);

  // get the list of asks or bids depending on the type param.
  // this operation defaults to the bids list if type != "buy"
  const orderList =
    type === "buy" ? sortedOrderbook[pair].asks : sortedOrderbook[pair].bids;

  if (numberIsInRange(limitInNumber, orderList)) {
    for (const entry of orderList) {
      const price = Number(entry[0]);
      const orders = Number(entry[1]);

      const operationToCompare =
        (rollingPrice * rollingOrders + price * orders) /
        (rollingOrders + orders);

      // the comparison between 'operationToCompare' and 'limitInNumber' will
      // vary depending on the type of operation (either 'buy' or 'sell')
      // the following ternary operation will set the proper order for
      // the operation depending on the type.
      const firstOperatorInComparison =
        type === "buy" ? operationToCompare : limitInNumber;
      const secondOperatorInComparison =
        type === "buy" ? limitInNumber : operationToCompare;

      if (rollingOrders === 0) {
        if (price === limitInNumber) {
          return orders;
        } else {
          rollingPrice += price;
          rollingOrders += orders;
        }
      } else if (rollingOrders > 0) {
        if (firstOperatorInComparison < secondOperatorInComparison) {
          rollingPrice = operationToCompare;
          rollingOrders += orders;
        } else if (operationToCompare === limitInNumber) {
          return rollingOrders + orders;
        } else {
          return (
            rollingOrders +
            (rollingPrice * rollingOrders - limitInNumber * rollingOrders) /
              (limitInNumber - price)
          );
        }
      } else {
        throw new Error("Param 'rollingOrders' cannot be less than zero");
      }
    }
  }
  return null;
}

// exports
module.exports = {
  createMemoryOrderBook,
  pairs,
  orderBookInitState,
  updateMemoryOrderBook,
  wsStringMulti,
  getTopOrders,
  sortOrderBook,
  copyOrderBook,
  getOrderBookInitState,
  getEffectivePrice,
  getMaxOrderSize,
  numberIsInRange
};
