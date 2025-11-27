const { Router } = require("express");
const router = Router();
const multer = require("multer");

const {
  test,
  createComplaint,
  getComplaints,
  getComplaintEvidence,
  DecisionComplaint,
} = require("../controllers/complaint.controller");
const upload = multer({ dest: "imgs/test" });
//prueba
router.post("/img/test", upload.single("imagenTest"), test);
//rutas
router.post("/img/proof", upload.single("proof"), createComplaint);
router.get("/complaints", getComplaints);
router.get("/complaints/:id/evidence", getComplaintEvidence);
router.post("/complaints/:id/decision", DecisionComplaint);

module.exports = router;
