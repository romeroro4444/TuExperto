const { Router } = require("express");
const router = Router();

const {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  deleteProfessionalById,
  editProfessional,
} = require("./../controllers/professionals.controller");
const { getMyServices } = require("../controllers/services.controller");
const authorization = require("./../middleware/authorization");

router.get("/professionals", getProfessionals);
router.get("/professional/:professional_id", getProfessionalById);
router.post("/professional", createProfessional);
router.delete("/professional/:professional_id", deleteProfessionalById);
router.put("/professional/:professional_id", editProfessional);
router.get("/my-services", authorization, getMyServices);

module.exports = router;
