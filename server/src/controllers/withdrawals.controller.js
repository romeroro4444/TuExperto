const pool = require("./../db");
const {
  sendDecisionAppointmentEmail,
} = require("./../services/email.service.js");

const requestWithdrawal = async (req, res) => {
  try {
    const user_id = req.user;
    const { amount, bank, account_number, rut, beneficiary_name, note } =
      req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    // obtener professional_id y balance
    const profRes = await pool.query(
      "SELECT professional_id, balance FROM professionals WHERE user_id = $1",
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no es profesional" });
    }
    const { professional_id, balance } = profRes.rows[0];

    if (Number(balance) < Number(amount)) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // Insertar en transacciones y descontar del balance
    const details = `Retiro solicitado: banco=${bank}; cuenta=${account_number}; rut=${rut}; beneficiario=${beneficiary_name}; nota=${note}`;
    try {
      await pool.query("BEGIN");
      await pool.query(
        "INSERT INTO transactions (professional_id, amount, transfer_details) VALUES ($1, $2, $3)",
        [professional_id, -Math.abs(Number(amount)), details]
      );

      const upd = await pool.query(
        "UPDATE professionals SET balance = COALESCE(balance,0) - $2 WHERE professional_id = $1 RETURNING balance",
        [professional_id, Number(amount)]
      );

      await pool.query("COMMIT");
      // nuevo balance
      const newBalance = upd.rows[0] ? upd.rows[0].balance : null;

      // enviar correo al admin con los datos
      const adminEmail = "tuexperto.cl@gmail.com";
      const userRes = await pool.query(
        "SELECT name, lastname, email FROM users WHERE user_id = $1",
        [user_id]
      );
      const user = userRes.rows[0] || {};
      const subject = "Nueva solicitud de retiro";
      const htmlContent = `
        <html>
          <body>
            <h2>Nueva solicitud de retiro</h2>
            <p>Profesional: ${user.name || ""} ${user.lastname || ""}</p>
            <p>Email: ${user.email || ""}</p>
            <p>Professional_id: ${professional_id}</p>
            <p>Monto: ${amount}</p>
            <p>Banco: ${bank}</p>
            <p>Cuenta: ${account_number}</p>
            <p>RUT: ${rut}</p>
            <p>Beneficiario: ${beneficiary_name}</p>
            <p>Nota: ${note || ""}</p>
            <p>Fecha: ${new Date().toISOString()}</p>
          </body>
        </html>
      `;
      try {
        await sendDecisionAppointmentEmail({
          toEmail: adminEmail,
          toName: "TuExperto Admin",
          subject,
          htmlContent,
        });
      } catch (emailErr) {
        console.error("Error enviando correo admin:", emailErr);
      }

      return res.json({
        message: "Solicitud de retiro registrada",
        balance: newBalance,
      });
    } catch (txErr) {
      console.error("Error en transacción de retiro:", txErr);
      try {
        await pool.query("ROLLBACK");
      } catch (rbErr) {
        console.error("Error al hacer rollback:", rbErr);
      }
      return res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

module.exports = { requestWithdrawal };
