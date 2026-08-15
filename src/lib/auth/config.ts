import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
          // Existing user — mark email as verified
          await db
            .update(users)
            .set({ status: "email_verified" })
            .where(eq(users.email, email));
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "owner";
        token.organizationId = user.organizationId || null;

        // Fetch status from DB since OAuth providers don't include it
        const userId = user.id as string;
        const [dbUser] = await db
          .select({ status: users.status })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        token.status = dbUser?.status || "pending";
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
