import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/clients - List client summaries for Admin view
export async function GET() {
  try {
    // Validate Layer 2 Admin check
    await requireAdmin();
    
    const summaries = store.getClientsSummaries();
    return NextResponse.json(summaries);
  } catch (error: any) {
    if (error.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
