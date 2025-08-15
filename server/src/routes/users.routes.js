const { Router } = require("express");
const router = Router();

const {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  editUser,
} = require("../controllers/users.controller");

router.get("/users", getUsers);
router.get("/user/:user_id", getUserById);
router.post("/user", createUser);
router.delete("/user/:user_id", deleteUserById);
router.put("/user/:user_id", editUser);

module.exports = router;
