import nodemailer from "nodemailer";
import { logger } from "./logger";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM ?? "no-reply@graysparkmasjid.org.uk";

const transporter =
  smtpHost && smtpPort && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const { to, subject, text, html } = options;

  if (!transporter) {
    logger.warn(
      { to, subject },
      "SMTP is not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS). Skipping email send.",
    );
    return;
  }

  await transporter.sendMail({ from: mailFrom, to, subject, text, html });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!transporter) {
    logger.warn(
      { to, resetUrl },
      "SMTP is not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS). Logging password reset link instead of sending email.",
    );
    return;
  }

  await sendEmail({
    to,
    subject: "Reset your Grays Park Masjid admin password",
    text: `You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });
}
