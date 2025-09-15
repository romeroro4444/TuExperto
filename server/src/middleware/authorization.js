const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
config();

module.exports = async (req, res, next) => {
  try {
    const token = req.header("token");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, autorización denegada" });
    }

    const payload = jwt.verify(token, process.env.jwtSecret);

    // Extrae solo el user_id del payload
    req.user = payload.user;
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ message: "Token inválido" });
  }

  next();
};
