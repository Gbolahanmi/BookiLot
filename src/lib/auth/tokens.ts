import jwt from "jsonwebtoken";

const secret = process.env.AUTH_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  purpose: "email_verification" | "password_reset";
}

export function generateToken(
  userId: string,
  email: string,
  purpose: "email_verification" | "password_reset"
): string {
  const expiresIn = purpose === "email_verification" ? "24h" : "1h";
  return jwt.sign({ userId, email, purpose }, secret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
