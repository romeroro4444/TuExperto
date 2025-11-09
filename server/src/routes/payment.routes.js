const { Router } = require("express");
const {
  createOrder,
  processPayment,
  handleWebhook,
} = require("../controllers/payment.controller");

const router = Router();

router.post("/create-order", createOrder);
router.post("/process_payment", processPayment);
router.get("/success", (req, res) => res.send("success"));
router.get("/failure", (req, res) => res.send("failure"));
router.get("/pending", (req, res) => res.send("pending"));
router.post("/webhook", handleWebhook);

module.exports = router;
