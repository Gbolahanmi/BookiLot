import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "bookings@bookilot.app";

/**
 * Send a transactional email.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: fromEmail,
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

/**
 * Send booking confirmation email.
 */
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
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Booking Confirmed</h2>
      <p>Hi ${params.customerName},</p>
      <p>Your booking with <strong>${params.businessName}</strong> has been confirmed.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> ${params.serviceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${params.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${params.time}</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${params.duration}</p>
      </div>
      
      <p>
        <a href="${params.manageUrl}" style="color: #0066cc;">
          Manage or cancel your booking
        </a>
      </p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This email was sent by Bookilot.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Booking confirmed with ${params.businessName}`,
    html,
  });
}

/**
 * Send booking reminder email.
 */
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
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Appointment Reminder</h2>
      <p>Hi ${params.customerName},</p>
      <p>This is a reminder that your appointment with <strong>${params.businessName}</strong> is tomorrow.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> ${params.serviceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${params.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${params.time}</p>
      </div>
      
      <p>
        <a href="${params.manageUrl}" style="color: #0066cc;">
          Manage or cancel your booking
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Reminder: Appointment tomorrow with ${params.businessName}`,
    html,
  });
}
