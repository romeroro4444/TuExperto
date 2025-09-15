const { Router } = require("express");
const router = Router();

const {
  getServices,
  getServiceById,
  createService,
  deleteServiceById,
  editServiceById,
} = require("../controllers/services.controller");

router.get("/services", getServices);
router.get("/service/:service_id", getServiceById);
const authorization = require("./../middleware/authorization");
router.post("/service", authorization, createService);
router.delete("/service/:service_id", deleteServiceById);
router.put("/service/:service_id", editServiceById);

module.exports = router;
