import { sendEmail } from "../lib/mailer.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const html = createWelcomeEmailTemplate(name, clientURL);

  const result = await sendEmail({
    to: email,
    subject: "Welcome to Chatify! 🎉",
    html,
  });

  if (result) {
    console.log("✅ Welcome email sent to", email);
  }
};
