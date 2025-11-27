const pool = require("./../db");
const fs = require("node:fs");
const path = require("node:path");
const { sendDecisionComplaintEmail } = require("../services/email.service");
/* const multer = require("multer");

const upload = multer({ dest: "./../../imgs/proofs" }); */

const test = (req, res) => {
  saveImage(req.file);
  res.send("prueba subida correctamente");
};

function saveImage(file) {
  const newPath = `imgs/test/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
}

const createComplaint = async (req, res) => {
  try {
    const {
      appointment_id,
      service_id,
      reason,
      title,
      description,
      date_of_incident,
    } = req.body;

    let evidencePath = null;
    if (req.file) {
      evidencePath = `imgs/proofs/${req.file.originalname}`;
      fs.renameSync(req.file.path, evidencePath);
    }

    // validar entradas básicas
    if (!appointment_id || !service_id) {
      return res
        .status(400)
        .json({ error: "appointment_id y service_id son requeridos" });
    }

    const text = `INSERT INTO complaints(
      appointment_id,
      service_id,
      reason,
      title,
      description,
      claim_status,
      date_of_incident,
      evidence
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const values = [
      appointment_id,
      service_id,
      reason,
      title,
      description,
      "PENDIENTE",
      date_of_incident,
      evidencePath,
    ];
    const insertRes = await pool.query(text, values);
    const updateRes = await pool.query(
      `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`,
      ["RECLAMO EN REVISIÓN", appointment_id]
    );

    if (updateRes.rowCount === 0) {
      // si la cita no existe
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Consultar el reclamo recién creado con los joins para incluir RUTs
    const fullQuery = `
      SELECT c.*,
             cu.rut AS client_rut,
             pu.rut AS professional_rut
      FROM complaints c
      LEFT JOIN appointments a ON c.appointment_id = a.appointment_id
      LEFT JOIN users cu ON a.user_id = cu.user_id
      LEFT JOIN services s ON c.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
      WHERE c.complaint_id = $1
    `;
    const fullRes = await pool.query(fullQuery, [
      insertRes.rows[0].complaint_id,
    ]);

    res.json({
      message: "Reclamo creado correctamente",
      complaint: fullRes.rows[0] || insertRes.rows[0],
      appointment: updateRes.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el reclamo" });
  }
};

const getComplaints = async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
             cu.rut AS client_rut,
             pu.rut AS professional_rut
      FROM complaints c
      LEFT JOIN appointments a ON c.appointment_id = a.appointment_id
      LEFT JOIN users cu ON a.user_id = cu.user_id
      LEFT JOIN services s ON c.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
      ORDER BY c.date_of_complaint DESC
    `;
    const response = await pool.query(query);
    // response.rows will include c.evidence (ruta en disco) si existe
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reclamos" });
  }
};

// mostrar evidencia
const getComplaintEvidence = async (req, res) => {
  try {
    const complaint_id = req.params.id;
    const resp = await pool.query(
      "SELECT evidence FROM complaints WHERE complaint_id = $1",
      [complaint_id]
    );
    if (resp.rows.length === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    const evidence = resp.rows[0].evidence;
    if (!evidence) {
      return res
        .status(404)
        .json({ error: "No hay evidencia para este reclamo" });
    }

    // construir ruta absoluta (evidence está guardada como 'imgs/proofs/archivo.ext')
    const fullPath = path.resolve(__dirname, "../../", evidence);
    if (!fs.existsSync(fullPath)) {
      return res
        .status(404)
        .json({ error: "Archivo de evidencia no encontrado en el servidor" });
    }

    // enviar el archivo. Dejar que el navegador lo muestre en nueva pestaña si es una imagen.
    return res.sendFile(fullPath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al servir la evidencia" });
  }
};

const DecisionComplaint = async (req, res) => {
  try {
    const complaint_id = req.params.id;

    // obtener complaint + appointment + client rut
    const cmpQuery = `
      SELECT c.*, a.appointment_id, u.rut AS client_rut
      FROM complaints c
      LEFT JOIN appointments a ON c.appointment_id = a.appointment_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE c.complaint_id = $1
    `;
    const cmpRes = await pool.query(cmpQuery, [complaint_id]);
    if (cmpRes.rows.length === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    const complaint = cmpRes.rows[0];
    const appointment_id = complaint.appointment_id;
    const client_rut = complaint.client_rut;

    const { comment = null, decision } = req.body;
    if (!decision) {
      return res.status(400).json({ error: "Se requiere el campo 'decision'" });
    }

    let complaintStatus = null;
    let appointmentStatus = null;
    if (decision === "APROBADO") {
      complaintStatus = "RECLAMO APROBADO";
      appointmentStatus = "RECLAMO APROBADO";
    } else if (decision === "RECHAZADO") {
      complaintStatus = "RECLAMO RECHAZADO";
      appointmentStatus = "RECLAMO RECHAZADO";
    } else {
      // permitir otros estados si es necesario
      complaintStatus = decision;
      appointmentStatus = decision;
    }

    // actualizar tabla complaints
    const updateComplaintRes = await pool.query(
      `UPDATE complaints SET claim_status = $1, decision_comment = $2 WHERE complaint_id = $3 RETURNING *`,
      [complaintStatus, comment, complaint_id]
    );

    // actualizar appointment asociado
    let updatedAppointment = null;
    if (appointment_id) {
      const updateApptRes = await pool.query(
        `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`,
        [appointmentStatus, appointment_id]
      );
      updatedAppointment = updateApptRes.rows[0] || null;
    }

    // enviar correo al cliente si tenemos su rut y correo
    if (client_rut) {
      const clientQuery =
        "SELECT name, lastname, email FROM users WHERE rut = $1";
      const clientRes = await pool.query(clientQuery, [client_rut]);
      if (clientRes.rows.length > 0) {
        const cliente = clientRes.rows[0];
        const subject =
          decision === "APROBADO" ? "RECLAMO ACEPTADO" : "RECLAMO RECHAZADO";
        const htmlContent = `
          <html>
            <body>
              <h1>Su reclamo ha sido ${
                decision === "APROBADO" ? "APROBADO" : "RECHAZADO"
              }</h1>
              <p>${
                comment ||
                "Contactar con administrador con el correo tuexperto.cl@gmail.com"
              }</p>
            </body>
          </html>
        `;
        try {
          await sendDecisionComplaintEmail({
            toEmail: cliente.email,
            toName: `${cliente.name} ${cliente.lastname}`,
            subject,
            htmlContent,
          });
        } catch (err) {
          console.error("Error enviando correo de decisión de reclamo:", err);
          // no bloquear la respuesta por fallo en envío de email
        }
      }
    }

    return res.json({
      message: "Decisión registrada",
      complaint: updateComplaintRes.rows[0],
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en tomar decisión" });
  }
};

module.exports = {
  test,
  createComplaint,
  getComplaints,
  getComplaintEvidence,
  DecisionComplaint,
};
