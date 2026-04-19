import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter = null;

// Try Resend first, fallback to Gmail SMTP
function getTransporter() {
  if (transporter) return transporter;

  if (ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD) {
    // Gmail SMTP with App Password
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.GMAIL_USER,
        pass: ENV.GMAIL_APP_PASSWORD,
      },
    });
    console.log("📧 Email configured via Gmail SMTP");
  } else if (ENV.RESEND_API_KEY) {
    // Resend SMTP bridge
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: ENV.RESEND_API_KEY,
      },
    });
    console.log("📧 Email configured via Resend SMTP");
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn("⚠️  No email provider configured. Set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY in .env");
    return null;
  }

  const fromEmail = ENV.GMAIL_USER || ENV.EMAIL_FROM || "noreply@chatify.app";
  const fromName = ENV.EMAIL_FROM_NAME || "Chatify";

  const info = await t.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  });

  return info;
}
