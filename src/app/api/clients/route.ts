import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { requireAdmin, handleApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const summaries = store.getClientsSummaries();
    return NextResponse.json(summaries);
  } catch (error) {
    return handleApiError(error);
  }
}
