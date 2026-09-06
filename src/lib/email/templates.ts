export interface TemplateParams {
  [key: string]: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
              <tr>
                <td style="padding: 32px 40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    This email was sent by Bookilot
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function button(url: string, text: string): string {
  return `
    <div style="margin: 24px 0;">
      <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        ${text}
      </a>
    </div>
  `;
}

function infoBox(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (r) =>
        `<p style="margin: 4px 0; font-size: 14px; color: #374151;"><strong>${r.label}:</strong> ${r.value}</p>`
    )
    .join("");
  return `
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
      ${cells}
    </div>
  `;
}

// ─── Verification Email ───────────────────────────────────
export function verificationTemplate(params: {
  name: string;
  url: string;
}): EmailTemplate {
  return {
    subject: "Verify your Bookilot account",
    html: baseLayout(`
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #111827;">Welcome to Bookilot!</h2>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hi ${params.name},</p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        Thanks for signing up. Click the button below to verify your email and get started.
      </p>
      ${button(params.url, "Verify Email")}
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
      </p>
    `),
  };
}

// ─── Password Reset Email ─────────────────────────────────
export function passwordResetTemplate(params: {
  url: string;
}): EmailTemplate {
  return {
    subject: "Reset your Bookilot password",
    html: baseLayout(`
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">Password Reset</h2>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        You requested a password reset for your Bookilot account.
      </p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        Click the link below to set a new password. This link expires in 1 hour.
      </p>
      ${button(params.url, "Reset Password")}
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
  };
}

// ─── Booking Confirmation Email ───────────────────────────
export function bookingConfirmationTemplate(params: {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: string;
  manageUrl: string;
}): EmailTemplate {
  return {
    subject: `Booking confirmed with ${params.businessName}`,
    html: baseLayout(`
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">Booking Confirmed</h2>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hi ${params.customerName},</p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        Your booking with <strong>${params.businessName}</strong> has been confirmed.
      </p>
      ${infoBox([
        { label: "Service", value: params.serviceName },
        { label: "Date", value: params.date },
        { label: "Time", value: params.time },
        { label: "Duration", value: params.duration },
      ])}
      <p style="margin: 0 0 8px; font-size: 16px; color: #374151;">
        <a href="${params.manageUrl}" style="color: #4f46e5; text-decoration: none;">Manage or cancel your booking</a>
      </p>
    `),
  };
}

// ─── Booking Reminder Email ───────────────────────────────
export function bookingReminderTemplate(params: {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  manageUrl: string;
}): EmailTemplate {
  return {
    subject: `Reminder: Appointment tomorrow with ${params.businessName}`,
    html: baseLayout(`
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">Appointment Reminder</h2>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hi ${params.customerName},</p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        This is a reminder that your appointment with <strong>${params.businessName}</strong> is tomorrow.
      </p>
      ${infoBox([
        { label: "Service", value: params.serviceName },
        { label: "Date", value: params.date },
        { label: "Time", value: params.time },
      ])}
      <p style="margin: 0 0 8px; font-size: 16px; color: #374151;">
        <a href="${params.manageUrl}" style="color: #4f46e5; text-decoration: none;">Manage or cancel your booking</a>
      </p>
    `),
  };
}

// ─── Staff Invite Email ───────────────────────────────────
export function staffInviteTemplate(params: {
  staffName: string;
  ownerName: string;
  businessName: string;
  inviteUrl: string;
}): EmailTemplate {
  return {
    subject: `You've been invited to join ${params.businessName} on Bookilot`,
    html: baseLayout(`
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">You're Invited!</h2>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hi ${params.staffName},</p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        <strong>${params.ownerName}</strong> has invited you to join <strong>${params.businessName}</strong> as a staff member on Bookilot.
      </p>
      <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
        Once you accept, you'll be able to:
      </p>
      <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 16px; color: #374151;">
        <li>View your assigned bookings</li>
        <li>Manage your availability (if enabled by owner)</li>
        <li>See your schedule</li>
      </ul>
      ${button(params.inviteUrl, "Accept Invitation")}
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        This invitation expires in 7 days. If you didn't expect this, you can safely ignore this email.
      </p>
    `),
  };
}
