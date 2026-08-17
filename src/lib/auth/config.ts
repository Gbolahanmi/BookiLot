import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // User exists but has no password (Google-only account)
        if (user && !user.passwordHash) return null;

        // User doesn't exist at all
        if (!user) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash!
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existing) {
          // Only mark as verified if they're still pending — don't overwrite active status
          await db
            .update(users)
            .set({ status: "email_verified" })
            .where(and(eq(users.email, email), eq(users.status, "pending")));
          // Assign DB UUID so jwt callback can look up the user
          user.id = existing.id;
        } else {
          // New user — create account
          const [created] = await db
            .insert(users)
            .values({
              email,
              name: user.name || "",
              status: "email_verified",
              role: "owner",
            })
            .returning({ id: users.id });

          // Attach the new user ID so jwt callback can find it
          user.id = created.id;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, check if user needs onboarding
      // url is the callbackUrl the client requested
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      // On initial sign-in, copy all fields from the authorize/oauth response
      if (user) {
        token.id = user.id;
        token.role = user.role || "owner";
        token.organizationId = user.organizationId || null;
      }

      // Always fetch fresh status + orgId from DB (fixes stale JWT after onboarding)
      const userId = (token.id || user?.id) as string;
      if (userId) {
        const [dbUser] = await db
          .select({ status: users.status, organizationId: users.organizationId })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (dbUser) {
          token.status = dbUser.status;
          token.organizationId = dbUser.organizationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "owner" | "staff" | "super_admin") || "owner";
        session.user.status = (token.status as "pending" | "email_verified" | "active") || "pending";
        session.user.organizationId = (token.organizationId as string) || null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
