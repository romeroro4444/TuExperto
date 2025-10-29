const { Router } = require("express");
const router = Router();

const {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  editUser,
  login,
  verify,
  getFullName,
  getAudit,
} = require("../controllers/users.controller");

const {
  getProfileByToken,
  editProfileByToken,
  getClientProfileByToken,
  editClientProfileByToken,
  getUserTypeByToken,
} = require("../controllers/profile.controller");

const validinfo = require("./../middleware/validinfo");
const authorization = require("./../middleware/authorization"); //comprueba el token

//Rutas para registro e inicio de sesión
router.get("/users", getUsers);
router.get("/user/:user_id", getUserById);
router.post("/user", validinfo, createUser);
router.delete("/user/:user_id", deleteUserById);
router.put("/user/:user_id", editUser);
router.post("/login", validinfo, login);
router.get("/verify", authorization, verify);
router.get("/fullname", authorization, getFullName);

//Rutas para el perfil
router.get("/profile", authorization, getProfileByToken);
router.get("/profile-client", authorization, getClientProfileByToken);
router.put("/profile-client", authorization, editClientProfileByToken);
router.put("/profile", authorization, editProfileByToken);
router.get("/user-type", authorization, getUserTypeByToken);

//auditorio
router.get("/audit", getAudit);

module.exports = router;
