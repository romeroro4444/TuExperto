// Servicio para enviar correos mediante Brevo
import brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.brevokey
);
//plantillas
function appointmentEmailTemplate({
  profesionalName,
  clientName,
  clientLastname,
}) {
  return `
    <html>
      <body>
        <h1>¡Nueva cita agendada!</h1>
        <p>${clientName} ${clientLastname} quiere agendar una cita contigo, ${profesionalName}.</p>
        <p>Inicia sesión en la página y revisa tus citas para aceptar o cancelar la cita</p>
      </body>
    </html>
  `;
}

function cancelAppointmentEmailTemplate({
  profesionalName,
  clientName,
  clientLastname,
  service,
  date,
}) {
  return `
    <html>
      <body>
        <h1>¡La cita con ${clientName} ${clientLastname} fue cancelada!</h1>
        <p>Estimado ${profesionalName},</p>
        <p>Su cita del servicio ${service} para el día y hora ${date} fue cancelada por ${clientName}</p>
      </body>
    </html>
  `;
}

// Enviar al experto un correo de que alguien quiere agendar con él
export const sendAppointmentEmail = async ({
  toEmail,
  toName,
  profesionalName,
  clientName,
  clientLastname,
}) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `¡Tienes una nueva cita agendada!`;
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.htmlContent = appointmentEmailTemplate({
      profesionalName,
      clientName,
      clientLastname,
    });
    sendSmtpEmail.sender = {
      name: "TuExperto",
      email: "rarr.14.r@gmail.com",
    };
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo enviado:", result);
    return result;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
};

// Enviar al experto cita fue cancelada
export const sendCancelAppointmentEmail = async ({
  toEmail,
  toName,
  profesionalName,
  clientName,
  clientLastname,
  service,
  date,
}) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "¡Su cita fue cancelada!";
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.htmlContent = cancelAppointmentEmailTemplate({
      profesionalName,
      clientName,
      clientLastname,
      service,
      date,
    });
    sendSmtpEmail.sender = {
      name: "TuExperto",
      email: "rarr.14.r@gmail.com",
    };
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo enviado:", result);
    return result;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
};

export const sendDecisionAppointmentEmail = async ({
  toEmail,
  toName,
  subject,
  htmlContent,
}) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: "TuExperto",
      email: "rarr.14.r@gmail.com",
    };
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo enviado:", result);
    return result;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
};
