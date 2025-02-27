import nodemailer from "nodemailer";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";

interface SendEmailProps {
  to: string;
  subject: string;
  component: ReactElement;
}

let transporter: nodemailer.Transporter | null = null;

const initializeEmailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      auth: {
        user: "jaimebillanueba99@gmail.com",
        pass: "kkpu opyf opsm ouxj",
      },
    });

    // Verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log("SMTP Connection Error:", error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, component }: SendEmailProps): Promise<nodemailer.SentMessageInfo> => {
  const emailTransporter = initializeEmailTransporter();

  try {
    const htmlContent = renderToString(component);

    const info = await emailTransporter.sendMail({
      from: `"Excursiones Tour Tour Valencia" <tourtovalencia@gmail.com>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Reserva Confirmada con éxito:", info.messageId);
    return info;
  } catch (error) {
    console.error("Fallo al enviar el correo:", error);
    throw error;
  }
};

// Clean up function to close the pool when the app shuts down
export const closeEmailTransporter = () => {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
};
