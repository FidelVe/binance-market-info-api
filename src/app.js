// src/app.js
// REST API server.
//

// imports
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

// server router
const router = require("./routes/routes");

// server port
const PORT = process.env.PORT || 3001;

// configuring middlewares
morgan.token("body", (req, res) => {
  if (req.body == null) {
    return {};
  } else {
    const bodyString = JSON.stringify(req.body);
    return bodyString.length < 120
      ? bodyString
      : bodyString.slice(0, 120) + "...";
  }
});

// create server
const app = express();

// apply middlewares
app.use(express.json());
app.use(helmet());
app.use(
  morgan(
    "> :method :req[header] :url :status :body - :response-time ms \n----------\n"
  )
);

async function runAsyncServer() {
  app.use("/api/v1", router);

  app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
  });
}

runAsyncServer();
