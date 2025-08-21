const { Router } = require("express");
const router = Router();

const {
  getProfessions,
  getProfessionById,
  createProfession,
  deleteProfessionById,
  editProfession,
} = require("../controllers/professions.controller");

router.get("/professions", getProfessions);
router.get("/profession/:profession_id", getProfessionById);
router.post("/profession", createProfession);
router.delete("/profession/:profession_id", deleteProfessionById);
router.put("/profession/:profession_id", editProfession);

module.exports = router;
