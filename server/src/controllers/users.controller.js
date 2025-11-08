const pool = require("./../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("./../utils/jwtGenerator");

const getUsers = async (req, res) => {
  try {
    const response = await pool.query(
      `SELECT u.*, ut.type_name AS tipo_usuario
       FROM users u
       LEFT JOIN users_usertype uut ON u.user_id = uut.user_id
       LEFT JOIN user_types ut ON uut.user_type_id = ut.user_type_id`
    );
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
    const { rut, name, lastname, email, password, telefono, tipo_usuario } =
      req.body;

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
    const user_id = response.rows[0].user_id;

    // Obtener el id_tipo_usuario según el nombre recibido
    const tipoRes = await pool.query(
      "SELECT user_type_id FROM USER_TYPES WHERE type_name = $1",
      [tipo_usuario]
    );
    if (tipoRes.rows.length === 0) {
      return res.status(400).json("Tipo de usuario no válido");
    }
    const id_tipo_usuario = tipoRes.rows[0].user_type_id;

    // insertar en Usuarios_TiposUsuarios
    await pool.query(
      "INSERT INTO USERS_USERTYPE (user_type_id, user_id) VALUES ($1, $2)",
      [id_tipo_usuario, user_id]
    );

    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "USERS", user_id, "POST", "Nuevo usuario registrado"]
    );

    // generate our jwt token
    const token = jwtGenerator(user_id);

    res.json({
      message: "user added succesfully",
      user_id,
      token,
      body: {
        user: { rut, name, lastname, email, password, telefono, tipo_usuario },
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
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "USERS", user_id, "DELETE", "Usuario eliminado"]
    );
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
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "USERS", user_id, "PUT", "Usuario editado"]
    );
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
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userRes.rows.length === 0) {
      return res.status(401).json("Email/Contraseña incorrecto");
    }

    const user = userRes.rows[0];
    const storedPassword = user.password;

    // If stored password looks like bcrypt, use bcrypt.compare as before
    let passwordMatches = false;
    if (
      typeof storedPassword === "string" &&
      (storedPassword.startsWith("$2a$") ||
        storedPassword.startsWith("$2b$") ||
        storedPassword.startsWith("$2y$"))
    ) {
      passwordMatches = await bcrypt.compare(password, storedPassword);
    } else {
      // Non-bcrypt password stored. Allow only if the user is ADMIN and the plaintext matches.
      try {
        const tipoRes = await pool.query(
          `SELECT ut.type_name FROM users_usertype uut JOIN user_types ut ON uut.user_type_id = ut.user_type_id WHERE uut.user_id = $1`,
          [user.user_id]
        );
        const tipo = tipoRes.rows[0] ? tipoRes.rows[0].type_name : null;
        if (tipo === "ADMIN" && password === storedPassword) {
          passwordMatches = true;
        }
      } catch (err) {
        console.error(
          "Error comprobando tipo de usuario para login legacy:",
          err
        );
      }
    }

    if (!passwordMatches) {
      return res.status(401).json("Email/Contraseña incorrecto");
    }

    // give them jwt token
    const token = jwtGenerator(user.user_id);
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

const getAudit = async (req, res) => {
  try {
    const response = await pool.query(
      `SELECT a.*, u.rut AS user_rut, u.name AS user_name
       FROM audit a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.event_date DESC`
    );
    res.json(response.rows);
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
  login,
  verify,
  getFullName,
  getAudit,
};
