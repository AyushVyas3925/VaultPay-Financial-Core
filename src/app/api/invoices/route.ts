import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { requireAuth, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  dueDate: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
});

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

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { clientId, clientName, clientEmail, dueDate, lineItems } = parsed.data;

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
