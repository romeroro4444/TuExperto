const pool = require("./../db");

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
    const text =
      "INSERT INTO users(rut, name, lastname, email, password, telefono) VALUES ($1,$2,$3,$4,$5,$6)";
    const values = [rut, name, lastname, email, password, telefono];
    const response = await pool.query(text, values);
    console.log(response);
    res.json({
      message: "user added succesfully",
      body: {
        user: { rut, name, lastname, email, password, telefono },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
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

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  editUser,
};
