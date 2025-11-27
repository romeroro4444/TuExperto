const pool = require("./../db");
const {
  sendAppointmentEmail,
  sendCancelAppointmentEmail,
  sendDecisionAppointmentEmail,
  sendPayAppointmentEmail,
} = require("../services/email.service.js");

const makeAppointment = async (req, res) => {
  try {
    const { service_id, user_id, reservation_date } = req.body;
    const text =
      "INSERT INTO appointments(service_id, user_id, reservation_date) VALUES($1,$2,$3) RETURNING *";
    const values = [service_id, user_id, reservation_date];
    const response = await pool.query(text, values);

    // obtener datos del profesional
    const profQuery = `
      SELECT pu.email AS professional_email, pu.name AS professional_name, s.title AS service_title
      FROM services s
      JOIN professionals prof ON s.professional_id = prof.professional_id
      JOIN users pu ON prof.user_id = pu.user_id
      WHERE s.service_id = $1
    `;
    const profRes = await pool.query(profQuery, [service_id]);
    const profesional = profRes.rows[0];

    // obtener datos del cliente
    const clientQuery = "SELECT name, lastname FROM users WHERE user_id = $1";
    const clientRes = await pool.query(clientQuery, [user_id]);
    const cliente = clientRes.rows[0];

    // enviar correo al profesional
    if (profesional && cliente) {
      await sendAppointmentEmail({
        toEmail: profesional.professional_email,
        toName: profesional.professional_name,
        profesionalName: profesional.professional_name,
        clientName: cliente.name,
        clientLastname: cliente.lastname,
      });
    }
    const appointment = response.rows[0];
    // auditorio
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
      [
        user_id,
        "appointments",
        appointment.appointment_id,
        "CREATE",
        `Creación de cita para servicio ${service_id} en fecha ${reservation_date}`,
      ]
    );
    // insertar en notifications
    const notiQuery = `
    INSERT INTO notifications (
      appointment_id,
      notification_type,
      recipient_email,
      subject,
      mesagge,
      date_sent,
      sent_status
    ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *
    `;

    const notiValues = [
      appointment.appointment_id,
      "CITA AGENDADA",
      profesional.professional_email,
      "¡Tienes una nueva cita agendada!",
      `${cliente.name} ${cliente.lastname} quiere agendar una cita contigo, ${profesional.professional_name} Inicia sesión en la página y revisa tus citas para aceptar o cancelar la cita.`,
      "ENVIADO",
    ];

    const notiRes = await pool.query(notiQuery, notiValues);

    res.json({
      message: "Agendado de manera correcta",
      body: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agendar la cita" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.appointment_id,
        a.service_id,
        a.user_id AS client_id,
        cu.rut AS client_rut,
        prof.professional_id,
        pu.rut AS professional_rut,
        s.title AS service_title,
        a.status,
        a.reservation_date
      FROM appointments a
      LEFT JOIN users cu ON a.user_id = cu.user_id
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
      ORDER BY a.reservation_date DESC
    `;
    const response = await pool.query(query);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};
const getNotifications = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM notifications");
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const user_id = req.user;
    const profRes = await pool.query(
      "SELECT professional_id FROM professionals WHERE user_id = $1",
      [user_id]
    );

    if (profRes.rows.length > 0) {
      const professional_id = profRes.rows[0].professional_id;
      // datos para Profesional
      const query = `SELECT 
        a.appointment_id, a.service_id, a.user_id AS client_id, a.reservation_date, a.status, 
        s.title, s.description, s.price, s.modality, s.duration, 
        u.name AS client_name, u.lastname AS client_lastname, u.email AS client_email, u.telefono AS client_telefono, 
        p.profession_name,
        prof.balance
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.service_id
        LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
        LEFT JOIN professions p ON prof.profession_id = p.profession_id
        LEFT JOIN users u ON a.user_id = u.user_id
        WHERE s.professional_id = $1
        ORDER BY a.reservation_date DESC`;

      const myAppointments = await pool.query(query, [professional_id]);
      return res.json(myAppointments.rows);
    }
    // datos para Cliente
    const query = `SELECT 
      a.appointment_id, a.service_id, a.user_id AS client_id, a.reservation_date, a.status, 
      s.title, s.description, s.price, s.modality, s.duration, 
      prof.professional_id AS professional_id, 
      pu.name AS professional_name, pu.lastname AS professional_lastname, pu.email AS professional_email, pu.telefono AS professional_telefono, 
      prof.balance AS professional_balance, 
      p.profession_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN professions p ON prof.profession_id = p.profession_id
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
      WHERE a.user_id = $1
      ORDER BY a.reservation_date DESC`;

    const myAppointments = await pool.query(query, [user_id]);

    res.json(myAppointments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las agendas" });
  }
};
//cancelar cita por el cliente
const cancelAppointment = async (req, res) => {
  try {
    const appointment_id = req.params.appointment_id;
    const appointmentRes = await pool.query(
      "SELECT service_id, user_id, reservation_date FROM appointments WHERE appointment_id = $1",
      [appointment_id]
    );
    const appointment = appointmentRes.rows[0];
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await pool.query(
      "UPDATE appointments SET status = $1 WHERE appointment_id = $2",
      ["CANCELADA", appointment_id] // cita cancelada
    );
    // auditorio
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
      [
        appointment.user_id,
        "APPOINTMENTS",
        appointment_id,
        "UPDATE",
        `Cancelación de cita para servicio ${appointment.service_id} en fecha ${appointment.reservation_date}`,
      ]
    );

    // datos del profesional
    const profQuery = `
      SELECT u.email AS professional_email, u.name AS professional_name
      FROM services s
      JOIN professionals prof ON s.professional_id = prof.professional_id
      JOIN users u ON prof.user_id = u.user_id
      WHERE s.service_id = $1
    `;
    const profRes = await pool.query(profQuery, [appointment.service_id]);
    const profesional = profRes.rows[0];

    // datos del cliente
    const clientQuery = "SELECT name, lastname FROM users WHERE user_id = $1";
    const clientRes = await pool.query(clientQuery, [appointment.user_id]);
    const cliente = clientRes.rows[0];

    // datos del servicio
    const serviceQuery = "SELECT title FROM services WHERE service_id = $1";
    const serviceRes = await pool.query(serviceQuery, [appointment.service_id]);
    const service = serviceRes.rows[0];

    // enviar correo de cancelación
    if (profesional && cliente && service) {
      await sendCancelAppointmentEmail({
        toEmail: profesional.professional_email,
        toName: profesional.professional_name,
        profesionalName: profesional.professional_name,
        clientName: cliente.name,
        clientLastname: cliente.lastname,
        service: service.title,
        date: appointment.reservation_date,
      });
    }

    // insertar en notifications
    const notiQuery = `
    INSERT INTO notifications (
      appointment_id,
      notification_type,
      recipient_email,
      subject,
      mesagge,
      date_sent,
      sent_status
    ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *
    `;

    const notiValues = [
      appointment_id,
      "CITA CANCELADA",
      profesional.professional_email,
      "¡Su cita fue cancelada!",
      `¡La cita con ${cliente.name} ${cliente.lastname} fue cancelada!`,
      "ENVIADO",
    ];

    const notiRes = await pool.query(notiQuery, notiValues);

    res.json({ message: "the Appointment was canceled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};

const decisionAppointment = async (req, res) => {
  try {
    const appointment_id = req.params.appointment_id;
    const { status } = req.body; // "ACEPTADA" o "RECHAZADA"

    const appointmentRes = await pool.query(
      "SELECT service_id, user_id, reservation_date FROM appointments WHERE appointment_id = $1",
      [appointment_id]
    );
    const appointment = appointmentRes.rows[0];
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await pool.query(
      "UPDATE appointments SET status = $1 WHERE appointment_id = $2",
      [status, appointment_id]
    );
    // auditorio
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
      [
        appointment.user_id,
        "APPOINTMENTS",
        appointment_id,
        "UPDATE",
        `Decisión de cita (${status}) para servicio ${appointment.service_id} en fecha ${appointment.reservation_date}`,
      ]
    );

    // datos del profesional
    const profQuery = `
      SELECT u.email AS professional_email, u.name AS professional_name, u.lastname AS professional_lastname
      FROM services s
      JOIN professionals prof ON s.professional_id = prof.professional_id
      JOIN users u ON prof.user_id = u.user_id
      WHERE s.service_id = $1
    `;
    const profRes = await pool.query(profQuery, [appointment.service_id]);
    const profesional = profRes.rows[0];

    // datos del cliente
    const clientQuery =
      "SELECT name, lastname, email FROM users WHERE user_id = $1";
    const clientRes = await pool.query(clientQuery, [appointment.user_id]);
    const cliente = clientRes.rows[0];

    // datos del servicio
    const serviceQuery = "SELECT title FROM services WHERE service_id = $1";
    const serviceRes = await pool.query(serviceQuery, [appointment.service_id]);
    const service = serviceRes.rows[0];

    // enviar correo y notificación según status
    let subject, message, notificationType, htmlContent;
    if (status === "ACEPTADA") {
      subject = "¡Su cita fue aceptada!";
      message = `¡La cita con ${profesional.professional_name} ${profesional.professional_lastname} para el servicio de ${service.title} para el día y hora ${appointment.reservation_date} fue aceptada! A continuación, pague su cita mediante la página en el apartado de citas`;
      notificationType = "CITA ACEPTADA";
      htmlContent = `
        <html>
          <body>
            <h1>¡Cita aceptada!</h1>
            <p>${message}</p>
          </body>
        </html>
      `;
    } else if (status === "RECHAZADA") {
      subject = "¡Su cita fue rechazada!";
      message = `¡La cita con ${profesional.professional_name} ${profesional.professional_lastname} para el servicio de ${service.title} para el día y hora ${appointment.reservation_date} fue rechazada!`;
      notificationType = "CITA RECHAZADA";
      htmlContent = `
        <html>
          <body>
            <h1>¡Cita rechazada!</h1>
            <p>${message}</p>
          </body>
        </html>
      `;
    }

    // enviar correo personalizado según decisión
    if (status === "ACEPTADA" || status === "RECHAZADA") {
      await sendDecisionAppointmentEmail({
        toEmail: cliente.email,
        toName: cliente.name,
        subject,
        htmlContent,
      });
    }

    // insertar en notifications
    const notiQuery = `
      INSERT INTO notifications (
        appointment_id,
        notification_type,
        recipient_email,
        subject,
        mesagge,
        date_sent,
        sent_status
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING *
    `;

    const notiValues = [
      appointment_id,
      notificationType,
      profesional.professional_email,
      subject,
      message,
      "ENVIADO",
    ];

    await pool.query(notiQuery, notiValues);

    res.json({ message: `the Appointment was ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

const payAppointment = async (req, res) => {
  try {
    const appointment_id = req.params.appointment_id;
    const { status } = req.body; // "PAGADA"

    const appointmentRes = await pool.query(
      "SELECT service_id, user_id, reservation_date FROM appointments WHERE appointment_id = $1",
      [appointment_id]
    );
    const appointment = appointmentRes.rows[0];
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await pool.query(
      "UPDATE appointments SET status = $1 WHERE appointment_id = $2",
      ["PAGADA", appointment_id]
    );
    // auditorio
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
      [
        appointment.user_id,
        "APPOINTMENTS",
        appointment_id,
        "UPDATE",
        `Decisión de cita PAGADA para servicio ${appointment.service_id} en fecha ${appointment.reservation_date}`,
      ]
    );
    // datos del profesional
    const profQuery = `
      SELECT u.email AS professional_email, u.name AS professional_name, u.lastname AS professional_lastname
      FROM services s
      JOIN professionals prof ON s.professional_id = prof.professional_id
      JOIN users u ON prof.user_id = u.user_id
      WHERE s.service_id = $1
    `;
    const profRes = await pool.query(profQuery, [appointment.service_id]);
    const profesional = profRes.rows[0];

    // datos del cliente
    const clientQuery =
      "SELECT name, lastname, email, telefono FROM users WHERE user_id = $1";
    const clientRes = await pool.query(clientQuery, [appointment.user_id]);
    const cliente = clientRes.rows[0];

    // datos del servicio
    const serviceQuery = "SELECT title FROM services WHERE service_id = $1";
    const serviceRes = await pool.query(serviceQuery, [appointment.service_id]);
    const service = serviceRes.rows[0];

    // enviar correo y notificación de pago
    const subject = "¡Su cita fue pagada!";
    const message = `¡La cita con ${cliente.name} ${cliente.lastname} para el servicio de ${service.title} para el día y hora ${appointment.reservation_date} fue pagada correctamente, por favor contactse con el cliente mediante el correo: ${cliente.email} o el número de teléfono: ${cliente.telefono}`;
    const notificationType = "CITA PAGADA";
    const htmlContent = `
      <html>
        <body>
          <h1>¡Cita pagada!</h1>
          <p>${message}</p>
        </body>
      </html>
    `;
    await sendPayAppointmentEmail({
      toEmail: profesional.professional_email,
      toName: profesional.name,
      subject,
      htmlContent,
    });

    // insertar en notifications
    const notiQuery = `
      INSERT INTO notifications (
        appointment_id,
        notification_type,
        recipient_email,
        subject,
        mesagge,
        date_sent,
        sent_status
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING *
    `;

    const notiValues = [
      appointment_id,
      notificationType,
      profesional.professional_email,
      subject,
      message,
      "ENVIADO",
    ];

    await pool.query(notiQuery, notiValues);

    // sumar precio del servicio al balance del profesional (CLP)
    const priceRes = await pool.query(
      `SELECT s.price, prof.professional_id
       FROM services s
       JOIN professionals prof ON s.professional_id = prof.professional_id
       WHERE s.service_id = $1`,
      [appointment.service_id]
    );
    const serviceInfo = priceRes.rows[0];
    if (serviceInfo && serviceInfo.professional_id) {
      await pool.query(
        `UPDATE professionals SET balance = COALESCE(balance,0) + $1 WHERE professional_id = $2`,
        [serviceInfo.price, serviceInfo.professional_id]
      );
    }

    res.json({ message: "Cita pagada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment_id = req.params.appointment_id;
    const query = `
      SELECT 
        a.appointment_id,
        a.service_id,
        a.reservation_date,
        s.title AS service_title,
        pu.name AS professional_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
      WHERE a.appointment_id = $1
    `;
    const response = await pool.query(query, [appointment_id]);
    if (response.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json(response.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la cita" });
  }
};

module.exports = {
  makeAppointment,
  getAppointments,
  getMyAppointments,
  getNotifications,
  cancelAppointment,
  decisionAppointment,
  payAppointment,
  getAppointmentById,
};
