// src/app.js
// REST API server.
//

// imports
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

// server router
const router = require("./routes/routes.js");

// server port
const PORT = process.env.PORT || 3001;
