const { Router } = require("express");
const router = Router();
const multer = require("multer");

const {
  test,
  createComplaint,
  getComplaints,
  getComplaintEvidence,
} = require("../controllers/complaint.controller");
const upload = multer({ dest: "imgs/test" });
//prueba
router.post("/img/test", upload.single("imagenTest"), test);
//rutas
router.post("/img/proof", upload.single("proof"), createComplaint);
router.get("/complaints", getComplaints);
router.get("/complaints/:id/evidence", getComplaintEvidence);

module.exports = router;
