const { Router } = require("express");
const router = Router();
const { createOrder } = require("../controllers/paypal.controller");

router.post("/paypal/createorder", createOrder);

module.exports = router;
