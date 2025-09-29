const { Router } = require("express");
const router = Router();

const authorization = require("../middleware/authorization");

const {
  getMyRequests,
  getRequests,
  getRequestById,
  createRequest,
  deleteRequestById,
  editRequestById,
  editRequestByToken,
  changeToActivateRequest,
  changeToDeactivateRequest,
  createRequestWithUserId,
} = require("./../controllers/requests.controller");

router.get("/requests", getRequests);
router.get("/request/:request_id", getRequestById);
router.post("/request", authorization, createRequest);
router.delete("/request/:request_id", deleteRequestById);
router.put("/request/:request_id", editRequestById);
//activar y desactivar solicitud
router.put("/request/:request_id/deactivate", changeToDeactivateRequest);
router.put("/request/:request_id/activate", changeToActivateRequest);
router.get("/my-requests", authorization, getMyRequests);

//editar solicitud
router.put("/editing-request", authorization, editRequestByToken);

router.post("/requestest", createRequestWithUserId);

module.exports = router;
