const { Router } = require("express");
const router = Router();

const {
  getServices,
  getServiceById,
  createService,
  deleteServiceById,
  editServiceById,
  changeToDeactivate,
  changeToActivate,
  approveService,
  rejectService,
  editServiceByToken,
} = require("../controllers/services.controller");

const authorization = require("./../middleware/authorization");

router.get("/services", getServices);
router.get("/service/:service_id", getServiceById);
router.post("/service", authorization, createService);
router.delete("/service/:service_id", deleteServiceById);
router.put("/service/:service_id", editServiceById);
//activar y desactivar servicio
router.put("/service/:service_id/deactivate", changeToDeactivate);
router.put("/service/:service_id/activate", changeToActivate);

// admin moderation routes
router.put("/service/:service_id/approve", authorization, approveService);
router.put("/service/:service_id/reject", authorization, rejectService);

//editar servicio
router.put("/editing-service", authorization, editServiceByToken);

module.exports = router;
