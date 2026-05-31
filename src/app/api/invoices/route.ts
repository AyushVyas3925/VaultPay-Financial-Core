import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { requireAuth, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/invoices - List invoices based on authentication role
export async function GET() {
  try {
    const session = await requireAuth();
    const user = session.user;
    if (!user || !user.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const invoices = store.getInvoices(user.role, user.clientId);
    return NextResponse.json(invoices);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    if (err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Validate Layer 2 Admin check
    await requireAdmin();
    
    const body = await req.json();
    const { clientId, clientName, clientEmail, dueDate, lineItems } = body;

    // Simple validation
    if (!clientId || !clientName || !clientEmail || !dueDate || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: "Missing required fields or invalid line items" }, { status: 400 });
    }

    // Create the invoice
    const newInvoice = store.createInvoice({
      clientId,
      clientName,
      clientEmail,
      dueDate,
      lineItems
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    if (err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
