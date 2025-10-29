const { Router } = require("express");
const router = Router();
const {
  createPaymentSession,
} = require("../controllers/payment.controller.js");

// POST /api/payments/session
router.post("/session", createPaymentSession);

module.exports = router;
