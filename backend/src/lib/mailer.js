import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.GMAIL_USER,
        pass: ENV.GMAIL_APP_PASSWORD,
      },
    });
    console.log("📧 Email configured via Gmail SMTP");
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn("⚠️  No email provider configured. Set GMAIL_USER + GMAIL_APP_PASSWORD in .env");
    return null;
  }

  const info = await t.sendMail({
    from: `${ENV.EMAIL_FROM_NAME || "Chatify"} <${ENV.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}
