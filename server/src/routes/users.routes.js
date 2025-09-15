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
} = require("../controllers/users.controller");

const validinfo = require("./../middleware/validinfo");
const authorization = require("./../middleware/authorization");

const profileController = require("../controllers/profile.controller");

router.get("/users", getUsers);
router.get("/user/:user_id", getUserById);
router.post("/user", validinfo, createUser);
router.delete("/user/:user_id", deleteUserById);
router.put("/user/:user_id", editUser);
router.post("/login", validinfo, login);
router.get("/verify", authorization, verify);
router.get("/fullname", authorization, getFullName);

// Ruta para obtener el perfil profesional usando el token
router.get("/profile", authorization, profileController.getProfileByToken);
// Ruta para obtener el perfil de cliente usando el token
router.get(
  "/profile-client",
  authorization,
  profileController.getClientProfileByToken
);
// Ruta para editar el perfil de cliente usando el token
router.put(
  "/profile-client",
  authorization,
  profileController.editClientProfileByToken
);
// Ruta para editar el perfil usando el token
router.put("/profile", authorization, profileController.editProfileByToken);
// Ruta para obtener el tipo de usuario usando el token
router.get("/user-type", authorization, profileController.getUserTypeByToken);

module.exports = router;
