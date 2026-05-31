import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/invoices/[id] - Fetch detailed invoice (IDOR protected)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const user = session.user;
    if (!user || !user.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = await context.params;
    
    // Retrieve invoice through ownership-aware data query layer (Layer 3 Security)
    const invoice = store.getInvoice(id, user.role, user.clientId);
    
    if (!invoice) {
      // Return 404 not 403 to prevent leaking that the document ID exists (OWASP standard)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    if (err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
