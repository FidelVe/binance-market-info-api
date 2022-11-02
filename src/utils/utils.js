// Variables
const pairs = ["btcusdt", "ethusdt", "bnbusdt"];
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
  // updating inMemoryOrderBook
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

module.exports = { createMemoryOrderBook, pairs, updateMemoryOrderBook };
