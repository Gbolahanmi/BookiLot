import { REMINDER_HOURS_BEFORE, OTP_LENGTH, OTP_EXPIRY_MINUTES } from "@/lib/constants";

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

/**
 * Send an SMS via Twilio.
 */
export async function sendSms(to: string, body: string): Promise<boolean> {
  try {
    const url = `${TWILIO_BASE}/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
      "base64"
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: body,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("SMS send failed:", error);
    return false;
  }
}

/**
 * Send booking confirmation SMS.
 */
export async function sendBookingConfirmation(
  phone: string,
  params: {
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    manageUrl: string;
  }
): Promise<boolean> {
  const message = [
    `✅ Booking confirmed!`,
    ``,
    `${params.serviceName}`,
    `📅 ${params.date} at ${params.time}`,
    `📍 ${params.businessName}`,
    ``,
    `Manage/Cancel: ${params.manageUrl}`,
    ``,
    `Reply CONFIRM to confirm or CANCEL to cancel.`,
  ].join("\n");

  return sendSms(phone, message);
}

/**
 * Send booking reminder SMS.
 */
export async function sendBookingReminder(
  phone: string,
  params: {
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    manageUrl: string;
  }
): Promise<boolean> {
  const message = [
    `⏰ Reminder: Your appointment is in ${REMINDER_HOURS_BEFORE} hours!`,
    ``,
    `${params.serviceName}`,
    `📅 ${params.date} at ${params.time}`,
    `📍 ${params.businessName}`,
    ``,
    `Reply YES to confirm or NO to cancel.`,
  ].join("\n");

  return sendSms(phone, message);
}

/**
 * Send OTP via SMS.
 */
export async function sendOtp(
  phone: string,
  otp: string
): Promise<boolean> {
  const message = `Your verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;
  return sendSms(phone, message);
}

/**
 * Generate a numeric OTP.
 */
export function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}
