const { Router } = require("express");
const router = Router();
const { requestWithdrawal } = require("../controllers/withdrawals.controller");
const authorization = require("../middleware/authorization");

router.post("/withdrawal", authorization, requestWithdrawal);

module.exports = router;
