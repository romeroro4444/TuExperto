const pool = require("../db");

// edita el perfil del cliente con token
const editClientProfileByToken = async (req, res) => {
  const user_id = req.user;
  if (!user_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o user_id no encontrado" });
  }
  const { name, lastname, telefono } = req.body;
  try {
    await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        lastname = COALESCE($2, lastname),
        telefono = COALESCE($3, telefono)
      WHERE user_id = $4`,
      [name, lastname, telefono, user_id]
    );
    res.json({ message: "Perfil de cliente actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar perfil de cliente" });
  }
};
// tipo de usuario por token
const getUserTypeByToken = async (req, res) => {
  const user_id = req.user;
  if (!user_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o user_id no encontrado" });
  }
  try {
    const typeRes = await pool.query(
      `SELECT ut.type_name
       FROM USERS_USERTYPE uut
       JOIN USER_TYPES ut ON uut.user_type_id = ut.user_type_id
       WHERE uut.user_id = $1 AND uut.active = TRUE
       LIMIT 1`,
      [user_id]
    );
    if (typeRes.rows.length === 0) {
      return res.status(404).json({ message: "Tipo de usuario no encontrado" });
    }
    res.json({ tipo_usuario: typeRes.rows[0].type_name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener tipo de usuario" });
  }
};
// datos del cliente por token
const getClientProfileByToken = async (req, res) => {
  const user_id = req.user;
  if (!user_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o user_id no encontrado" });
  }
  try {
    const userRes = await pool.query(
      "SELECT user_id, name, lastname, email, rut, telefono FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const user = userRes.rows[0];
    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener perfil de cliente" });
  }
};
// edita el perfil del experto usando el token
const editProfileByToken = async (req, res) => {
  const user_id = req.user;
  if (!user_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o user_id no encontrado" });
  }
  const { name, lastname, telefono, description, profession_id } = req.body;
  try {
    // editar datos de usuario
    if (name || lastname || telefono) {
      await pool.query(
        `UPDATE users SET
          name = COALESCE($1, name),
          lastname = COALESCE($2, lastname),
          telefono = COALESCE($3, telefono)
        WHERE user_id = $4`,
        [name, lastname, telefono, user_id]
      );
    }
    // verificar si es profesional
    const profRes = await pool.query(
      `SELECT professional_id FROM professionals WHERE user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length > 0) {
      // editar datos de profesional
      await pool.query(
        `UPDATE professionals SET
          description = COALESCE($1, description),
          profession_id = COALESCE($2, profession_id)
        WHERE user_id = $3`,
        [description, profession_id, user_id]
      );
    }
    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar perfil" });
  }
};

/* // obtiene todos los datos del perfil profesional por user_id
const getProfileByUserId = async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id || user_id === "null" || user_id === "undefined") {
    return res.status(400).json({ message: "user_id inválido" });
  }
  try {
    // datos del usuario
    const userRes = await pool.query(
      "SELECT user_id, name, lastname, email, rut, telefono FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const user = userRes.rows[0];

    // datos del profesional
    const profRes = await pool.query(
      `SELECT p.professional_id, p.description, p.verified, pr.profession_name
       FROM professionals p
       JOIN professions pr ON p.profession_id = pr.profession_id
       WHERE p.user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }
    const professional = profRes.rows[0];

    // especializaciones
    const specRes = await pool.query(
      `SELECT s.specialization_id, s.specialization_name
       FROM professionals_specialization ps
       JOIN specializations s ON ps.specialization_id = s.specialization_id
       WHERE ps.professional_id = $1`,
      [professional.professional_id]
    );
    const specializations = specRes.rows;

    res.json({
      user,
      professional,
      specializations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
}; */

// obtiene perfil usando el user_id extraído del token
const getProfileByToken = async (req, res) => {
  const user_id = req.user;
  if (!user_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o user_id no encontrado" });
  }
  try {
    // datos del usuario
    const userRes = await pool.query(
      "SELECT user_id, name, lastname, email, rut, telefono FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const user = userRes.rows[0];

    // datos del profesional
    const profRes = await pool.query(
      `SELECT p.professional_id, p.description, p.verified, pr.profession_name
       FROM professionals p
       JOIN professions pr ON p.profession_id = pr.profession_id
       WHERE p.user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }
    const professional = profRes.rows[0];

    // especializaciones
    const specRes = await pool.query(
      `SELECT s.specialization_id, s.specialization_name
       FROM professionals_specialization ps
       JOIN specializations s ON ps.specialization_id = s.specialization_id
       WHERE ps.professional_id = $1`,
      [professional.professional_id]
    );
    const specializations = specRes.rows;

    res.json({
      user,
      professional,
      specializations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

module.exports = {
  getProfileByToken,
  editProfileByToken,
  getClientProfileByToken,
  editClientProfileByToken,
  getUserTypeByToken,
};
