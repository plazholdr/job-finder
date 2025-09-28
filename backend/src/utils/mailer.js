import nodemailer from 'nodemailer';

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_FROM
  } = process.env;

  const port = Number(EMAIL_PORT || 587);
  const secure = String(EMAIL_SECURE || 'false').toLowerCase() === 'true';

  cachedTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });

  cachedTransporter.__from = EMAIL_FROM || EMAIL_USER;
  return cachedTransporter;
}

async function sendMail({ to, subject, text, html, attachments }) {
  const transporter = getTransporter();
  const from = transporter.__from;
  const info = await transporter.sendMail({ from, to, subject, text, html, attachments });
  return info;
}

export { getTransporter, sendMail };

