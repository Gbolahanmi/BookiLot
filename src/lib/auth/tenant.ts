import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/lib/constants";

/**
 * Get the current AuthJS session.
 */
export async function getSession() {
  return auth();
}

/**
 * Get the current user's organization ID from the session.
 */
export async function getOrganizationId(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user?.organizationId || null;
}

/**
 * Get the current user with their organization details.
 */
export async function getUserWithOrganization() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      organizationId: users.organizationId,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      orgTimezone: organizations.timezone,
    })
    .from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user || null;
}

/**
 * Require authentication — throws if not logged in.
 */
export async function requireAuth() {
  const user = await getUserWithOrganization();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require owner role — throws if not owner or super_admin.
 */
export async function requireOwner() {
  const user = await requireAuth();
  if (user.role !== "owner" && user.role !== "super_admin") {
    throw new Error("Owner access required");
  }
  return user;
}

/**
 * Require staff role — throws if not staff, owner, or super_admin.
 */
export async function requireStaff() {
  const user = await requireAuth();
  const allowedRoles: UserRole[] = ["owner", "staff", "super_admin"];
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Staff access required");
  }
  return user;
}

/**
 * Require active account — throws if not active.
 */
export async function requireActive() {
  const user = await requireAuth();
  if (user.status !== "active") {
    throw new Error("Account setup not complete");
  }
  return user;
}

/**
 * Resolve organization ID from widget embed request.
 */
export function resolveWidgetOrgId(searchParams: URLSearchParams): string | null {
  return searchParams.get("orgId");
}

/**
 * Resolve organization ID from phone number (for SMS/voice channels).
 */
export async function resolveOrgFromPhone(_phoneNumber: string): Promise<string | null> {
  // TODO: Implement phone number → organization mapping
  return null;
}
