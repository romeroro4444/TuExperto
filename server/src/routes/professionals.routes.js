const { Router } = require("express");
const router = Router();

const {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  deleteProfessionalById,
  editProfessional,
} = require("./../controllers/professionals.controller");

router.get("/professionals", getProfessionals);
router.get("/professional/:professional_id", getProfessionalById);
router.post("/professional", createProfessional);
router.delete("/professional/:professional_id", deleteProfessionalById);
router.put("/professional/:professional_id", editProfessional);

module.exports = router;
