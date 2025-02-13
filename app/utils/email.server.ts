import nodemailer from "nodemailer";
import { renderToString } from "react-dom/server";
import { ReactElement } from "react";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    // Use App Password if 2FA is enabled: https://myaccount.google.com/apppasswords
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailProps {
  to: string;
  subject: string;
  component: ReactElement;
}

export const sendEmail = async ({ to, subject, component }: SendEmailProps) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Email credentials are not set");
  }

  try {
    const htmlContent = renderToString(component);
    
    const info = await transporter.sendMail({
      from: `"Your Restaurant" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}; 