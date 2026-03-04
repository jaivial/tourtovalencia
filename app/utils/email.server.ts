import nodemailer from "nodemailer";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import fs from "fs";
import path from "path";

interface SendEmailProps {
  to: string;
  subject: string;
  component: ReactElement;
}

// Define DKIM configuration interface
interface DkimConfig {
  domainName: string;
  keySelector: string;
  privateKey: string;
}

let transporter: nodemailer.Transporter | null = null;

// Try to load DKIM private key if it exists
const getDkimConfig = (): DkimConfig | null => {
  try {
    if (process.env.DKIM_PRIVATE_KEY) {
      return {
        domainName: process.env.DKIM_DOMAIN || "tourtovalencia.jaimedigitalstudio.com",
        keySelector: process.env.DKIM_SELECTOR || "default",
        privateKey: process.env.DKIM_PRIVATE_KEY,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error loading DKIM configuration:", error);
    return null;
  }
};

const initializeEmailTransporter = () => {
  if (!transporter) {
    const dkimConfig = getDkimConfig();
    const smtpUser = (process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
    const rawSmtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "";
    const smtpPass = rawSmtpPass.replace(/\s+/g, "");

    if (rawSmtpPass && rawSmtpPass !== smtpPass) {
      console.warn("SMTP password contains whitespace; normalizing before authentication.");
    }

    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP credentials are missing. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
    }
    
    // Create the basic transport configuration
    const transportConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || "587"),
      secure: (process.env.SMTP_PORT || "587") === "465",
      requireTLS: true,
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 10000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };
    
    // Create the transporter with or without DKIM
    if (dkimConfig) {
      transporter = nodemailer.createTransport({
        ...transportConfig,
        dkim: {
          domainName: dkimConfig.domainName,
          keySelector: dkimConfig.keySelector,
          privateKey: dkimConfig.privateKey
        }
      });
    } else {
      transporter = nodemailer.createTransport(transportConfig);
    }

    // Verify connection configuration
    transporter.verify(function (error) {
      if (error) {
        console.log("SMTP Connection Error:", error);
      } else {
        console.log("Server is ready to take our messages");
        if (dkimConfig) {
          console.log("DKIM signing is enabled for domain:", dkimConfig.domainName);
        } else {
          console.log("DKIM signing is not configured. Emails may go to spam folders.");
        }
      }
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, component }: SendEmailProps): Promise<nodemailer.SentMessageInfo> => {
  const emailTransporter = initializeEmailTransporter();
  const smtpFrom = process.env.EMAIL_FROM || process.env.GMAIL_USER || "tourtovalencia@gmail.com";

  try {
    const htmlContent = renderToString(component);
    
    // Create text version from HTML for better deliverability
    const textContent = htmlContent
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Path to the logo image - adjust this path to where your logo is stored
    const logoPath = path.join(process.cwd(), "public", "tourtovalencialogo.png");
    
    // Check if the logo file exists
    if (!fs.existsSync(logoPath)) {
      console.warn(`Logo file not found at ${logoPath}. Using fallback URL.`);
    }

    const info = await emailTransporter.sendMail({
      from: `"Tour To Valencia" <${smtpFrom}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent, // Adding plain text version improves deliverability
      headers: {
        'X-Priority': '1', // High priority
        'Importance': 'high',
        'X-MSMail-Priority': 'High',
      },
      attachments: [
        {
          filename: 'tourtovalencialogo.png',
          path: fs.existsSync(logoPath) ? logoPath : 'https://tourtovalencia.com/tourtovalencialogo.png',
          cid: 'tourtovalencialogo' // Same as the src value in your email template
        }
      ]
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
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
