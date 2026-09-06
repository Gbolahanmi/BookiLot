import nodemailer from "nodemailer";
import {
  verificationTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  bookingReminderTemplate,
  staffInviteTemplate,
} from "./templates";

// ─── Transporter (lazy singleton) ─────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

function getFromAddress(): string {
  const name = process.env.FROM_NAME || "Bookilot";
  const email = process.env.FROM_EMAIL || "bookings@bookilot.app";
  return `${name} <${email}>`;
}

// ─── Low-level send ───────────────────────────────────────
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

// ─── High-level helpers ───────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  params: { name: string; token: string }
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${appUrl}/api/auth/verify-email?token=${params.token}`;
  const template = verificationTemplate({ name: params.name, url });
  return sendEmail({ to, ...template });
}

export async function sendPasswordResetEmail(
  to: string,
  params: { token: string }
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${appUrl}/reset-password?token=${params.token}`;
  const template = passwordResetTemplate({ url });
  return sendEmail({ to, ...template });
}

export async function sendBookingConfirmationEmail(
  to: string,
  params: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    duration: string;
    manageUrl: string;
  }
): Promise<boolean> {
  const template = bookingConfirmationTemplate(params);
  return sendEmail({ to, ...template });
}

export async function sendBookingReminderEmail(
  to: string,
  params: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    manageUrl: string;
  }
): Promise<boolean> {
  const template = bookingReminderTemplate(params);
  return sendEmail({ to, ...template });
}

export async function sendStaffInviteEmail(
  to: string,
  params: {
    staffName: string;
    ownerName: string;
    businessName: string;
    inviteUrl: string;
  }
): Promise<boolean> {
  const template = staffInviteTemplate(params);
  return sendEmail({ to, ...template });
}
