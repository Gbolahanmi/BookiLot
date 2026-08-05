import { DefaultSession } from "next-auth";
import { UserRole, AccountStatus } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: AccountStatus;
      organizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    status?: AccountStatus;
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    status?: AccountStatus;
    organizationId?: string | null;
  }
}
