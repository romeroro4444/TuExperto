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

router.get("/users", getUsers);
router.get("/user/:user_id", getUserById);
router.post("/user", validinfo, createUser);
router.delete("/user/:user_id", deleteUserById);
router.put("/user/:user_id", editUser);
router.post("/login", validinfo, login);
router.get("/verify", authorization, verify);
router.get("/fullname", authorization, getFullName);

module.exports = router;
