const pool = require("./../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("./../utils/jwtGenerator");

const getUsers = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM users");
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const response = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (req, res) => {
  try {
    const { rut, name, lastname, email, password, telefono } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR rut = $2",
      [email, rut]
    );

    if (user.rows.length !== 0) {
      return res.status(401).json("El usuario con ese email/rut ya existe");
    }

    // Bcrypt the user password

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcryptPasword = await bcrypt.hash(password, salt);

    const text =
      "INSERT INTO users(rut, name, lastname, email, password, telefono) VALUES ($1,$2,$3,$4,$5,$6) RETURNING user_id";
    const values = [rut, name, lastname, email, bcryptPasword, telefono];
    const response = await pool.query(text, values);
    console.log(response);

    // generate our jwt token
    const token = jwtGenerator(response.rows[0].user_id);

    res.json({
      message: "user added succesfully",
      user_id: response.rows[0].user_id,
      token,
      body: {
        user: { rut, name, lastname, email, password, telefono },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    // elimina de la tabla users_usertype
    await pool.query("DELETE FROM users_usertype WHERE user_id = $1", [
      user_id,
    ]);
    const text = "DELETE FROM users WHERE user_id = $1";
    const response = await pool.query(text, [user_id]);
    console.log(response);
    res.json({
      message: `User with user_id ${user_id} deleted`,
    });
  } catch (error) {
    console.log(error);
  }
};

const editUser = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { name, lastname, email, password, telefono } = req.body;
    const text =
      "UPDATE users SET name = $1, lastname = $2, email = $3, password = $4, telefono = $5 WHERE user_id = $6";
    const values = [name, lastname, email, password, telefono, user_id];
    const response = await pool.query(text, values);
    console.log(response);
    res.json({
      message: "user edited succesfully",
      body: {
        user: { name, lastname, email, password, telefono },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Email/Contraseña incorrecto");
    }
    // check if incoming password is the same the db password

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json("Email/Contraseña incorrecto");
    }
    //give them jwt token

    const token = jwtGenerator(user.rows[0].user_id);
    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

const verify = async (req, res) => {
  try {
    res.json(true);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

const getFullName = async (req, res) => {
  try {
    // req.user has the payload
    // res.json(req.user);

    const user = await pool.query(
      "SELECT name, lastname FROM users WHERE user_id = $1",
      [req.user]
    ); // si solo quiero el nombre en vez de * colocar name
    res.json({ name: user.rows[0].name, lastname: user.rows[0].lastname });
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  editUser,
  login,
  verify,
  getFullName,
};
