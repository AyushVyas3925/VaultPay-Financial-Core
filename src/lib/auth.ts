import { auth } from "@/auth";
import { NextResponse } from "next/server";

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
  const user = session.user;
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireClient() {
  const session = await requireAuth();
  const user = session.user;
  if (!user || user.role !== "client") {
    throw new Error("Forbidden");
  }
  return session;
}

export function handleApiError(error: unknown) {
  const err = error instanceof Error ? error : new Error("Unknown error");
  if (err.message === "Unauthenticated") {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (err.message === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
