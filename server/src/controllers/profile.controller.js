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
    // obtener datos actuales antes de actualizar
    const prevRes = await pool.query(
      "SELECT name, lastname, telefono FROM users WHERE user_id = $1",
      [user_id]
    );
    const prev = prevRes.rows[0];

    await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        lastname = COALESCE($2, lastname),
        telefono = COALESCE($3, telefono)
      WHERE user_id = $4`,
      [name, lastname, telefono, user_id]
    );

    // Construir descripción con cambios
    const cambios = [];
    if (name && name !== prev.name)
      cambios.push(`name: '${prev.name}' → '${name}'`);
    if (lastname && lastname !== prev.lastname)
      cambios.push(`lastname: '${prev.lastname}' → '${lastname}'`);
    if (telefono && telefono !== prev.telefono)
      cambios.push(`telefono: '${prev.telefono}' → '${telefono}'`);
    const descripcion =
      cambios.length > 0
        ? `Perfil editado. Cambios: ${cambios.join(", ")}`
        : "Perfil editado. Sin cambios en los datos.";

    // auditoria
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "USERS", user_id, "PUT", descripcion]
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

    // Disable caching for this endpoint to avoid browser 304 cached responses
    // which can make the frontend receive no body and treat the response as empty.
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

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
    const prevRes = await pool.query(
      "SELECT name, lastname, telefono FROM users WHERE user_id = $1",
      [user_id]
    );
    const prev = prevRes.rows[0];

    // obtener datos actuales de profesional (si existe)
    const profRes = await pool.query(
      `SELECT professional_id FROM professionals WHERE user_id = $1`,
      [user_id]
    );
    let prevProf = null;
    if (profRes.rows.length > 0) {
      const professional_id = profRes.rows[0].professional_id;
      const prevResProf = await pool.query(
        "SELECT description, profession_id FROM professionals WHERE professional_id = $1",
        [professional_id]
      );
      prevProf = prevResProf.rows[0];
    }
    // actualizar datos de usuario
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
    // actualizar datos de profesional si existe
    if (profRes.rows.length > 0) {
      await pool.query(
        `UPDATE professionals SET
          description = COALESCE($1, description),
          profession_id = COALESCE($2, profession_id)
        WHERE user_id = $3`,
        [description, profession_id, user_id]
      );
    }
    const cambios = [];
    if (name && prev && name !== prev.name)
      cambios.push(`name: '${prev.name}' → '${name}'`);
    if (lastname && prev && lastname !== prev.lastname)
      cambios.push(`lastname: '${prev.lastname}' → '${lastname}'`);
    if (telefono && prev && telefono !== prev.telefono)
      cambios.push(`telefono: '${prev.telefono}' → '${telefono}'`);
    if (profRes.rows.length > 0 && prevProf) {
      if (description && description !== prevProf.description)
        cambios.push(
          `description: '${prevProf.description}' → '${description}'`
        );
      if (
        typeof profession_id !== "undefined" &&
        prevProf.profession_id !== profession_id
      )
        cambios.push(
          `profession_id: '${prevProf.profession_id}' → '${profession_id}'`
        );
    }
    const descripcion =
      cambios.length > 0
        ? `Perfil editado. Cambios: ${cambios.join(", ")}`
        : "Perfil editado. Sin cambios en los datos.";

    // auditoría
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "USERS", user_id, "PUT", descripcion]
    );

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar perfil" });
  }
};

// obtiene todos los datos del perfil profesional por user_id
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
      `SELECT p.professional_id, p.description, p.verified, p.review_count, pr.profession_name
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
      `SELECT p.professional_id, p.description, p.verified, p.review_count, pr.profession_name
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

const verifyAccount = async (req, res) => {
  try {
    const user_id = req.user;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const profRes = await pool.query(
      `SELECT p.professional_id, u.email, u.name, u.lastname, u.rut
       FROM professionals p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }
    const prof = profRes.rows[0];

    const serverUrl = process.env.SERVER_URL || "http://localhost:4000";
    const acceptLink = `${serverUrl}/verify-decision?professional_id=${prof.professional_id}&decision=accept`;
    const rejectLink = `${serverUrl}/verify-decision?professional_id=${prof.professional_id}&decision=reject`;

    const {
      sendDecisionAppointmentEmail,
    } = require("../services/email.service");

    const subject = `Solicitud de verificación: ${prof.name} ${prof.lastname}`;
    const htmlContent = `
      <p>Se ha solicitado la verificación de la cuenta del profesional <strong>${prof.name} ${prof.lastname}</strong>.</p>
      <p>ID profesional: ${prof.professional_id}</p>
      <p>Rut: ${prof.rut}</p>
      
      <p>Acciones:</p>
      <ul>
        <li><a href="${acceptLink}">Aceptar verificación</a></li>
        <li><a href="${rejectLink}">Rechazar verificación</a></li>
      </ul>
    `;

    await sendDecisionAppointmentEmail({
      toEmail: "tuexperto.cl@gmail.com",
      toName: "Administrador TuExperto",
      subject,
      htmlContent,
    });

    return res.json({ message: "Solicitud enviada al administrador" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al solicitar verificación" });
  }
};

const verificationDecision = async (req, res) => {
  try {
    const { professional_id, decision } = req.query;
    if (!professional_id || !decision) {
      return res.status(400).send("Missing parameters");
    }

    // get professional user info
    const profRes = await pool.query(
      "SELECT p.professional_id, p.user_id, u.email, u.name, u.lastname FROM professionals p JOIN users u ON p.user_id = u.user_id WHERE p.professional_id = $1",
      [professional_id]
    );
    if (profRes.rows.length === 0) {
      return res.status(404).send("Professional not found");
    }
    const prof = profRes.rows[0];

    if (decision === "accept") {
      await pool.query(
        "UPDATE professionals SET verified = TRUE WHERE professional_id = $1",
        [professional_id]
      );

      const subject = "Tu cuenta ha sido verificada";
      const htmlContent = `<p>Hola ${prof.name},</p><p>Tu cuenta ha sido verificada por el administrador. Ahora aparecerás como profesional verificado en TuExperto.</p>`;
      const {
        sendDecisionAppointmentEmail,
      } = require("../services/email.service");
      await sendDecisionAppointmentEmail({
        toEmail: prof.email,
        toName: `${prof.name} ${prof.lastname}`,
        subject,
        htmlContent,
      });

      return res.send("<h2>Usuario verificado correctamente.</h2>");
    }

    if (decision === "reject") {
      const subject = "Solicitud de verificación rechazada";
      const htmlContent = `<p>Hola ${prof.name},</p><p>La solicitud de verificación de tu cuenta fue <strong>rechazada</strong> por el administrador.</p>`;
      const {
        sendDecisionAppointmentEmail,
      } = require("../services/email.service");
      await sendDecisionAppointmentEmail({
        toEmail: prof.email,
        toName: `${prof.name} ${prof.lastname}`,
        subject,
        htmlContent,
      });
      return res.send(
        "<h2>Solicitud rechazada y correo enviado al profesional.</h2>"
      );
    }

    return res.status(400).send("Decision no válida");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error procesando la decisión");
  }
};

// obtiene perfil público por professional_id (sin auth)
const getProfileByProfessionalId = async (req, res) => {
  const professional_id = req.params.professional_id;
  if (!professional_id)
    return res.status(400).json({ message: "professional_id inválido" });
  try {
    const profRes = await pool.query(
      `SELECT p.professional_id, p.description, p.verified, p.review_count, pr.profession_name, u.user_id, u.name, u.lastname, u.rut, u.telefono
       FROM professionals p
       JOIN professions pr ON p.profession_id = pr.profession_id
       JOIN users u ON p.user_id = u.user_id
       WHERE p.professional_id = $1`,
      [professional_id]
    );
    if (profRes.rows.length === 0)
      return res.status(404).json({ message: "Profesional no encontrado" });
    const row = profRes.rows[0];

    const specRes = await pool.query(
      `SELECT s.specialization_id, s.specialization_name
       FROM professionals_specialization ps
       JOIN specializations s ON ps.specialization_id = s.specialization_id
       WHERE ps.professional_id = $1`,
      [professional_id]
    );

    res.json({
      user: {
        user_id: row.user_id,
        name: row.name,
        lastname: row.lastname,
        rut: row.rut,
        telefono: row.telefono,
      },
      professional: {
        professional_id: row.professional_id,
        description: row.description,
        verified: row.verified,
        review_count: row.review_count,
        profession_name: row.profession_name,
      },
      specializations: specRes.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

module.exports = {
  getProfileByToken,
  editProfileByToken,
  getClientProfileByToken,
  editClientProfileByToken,
  getUserTypeByToken,
  verifyAccount,
  verificationDecision,
  getProfileByProfessionalId,
};
