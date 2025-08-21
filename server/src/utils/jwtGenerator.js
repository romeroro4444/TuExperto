const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
config();

function jwtGenerator(user_id) {
  const payload = {
    user: user_id,
  };

  return jwt.sign(payload, process.env.jwtsecret, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;
