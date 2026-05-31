import { auth } from "@/auth";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error("Unauthenticated");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const user = session.user as any;
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireClient() {
  const session = await requireAuth();
  const user = session.user as any;
  if (user.role !== "client") {
    throw new Error("Forbidden");
  }
  return session;
}
