const express = require("express");
const controller = require("../controllers/controllers");
const router = express.Router();

router.get("/pairs", controller.getPairs);
router.get("/pairs/:pair", controller.getPair);
router.get("/eff-price/:pairName-:opType-:amount", controller.getEffPrice);

module.exports = router;
