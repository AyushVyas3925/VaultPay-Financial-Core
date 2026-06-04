import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { requireAuth, handleApiError } from "@/lib/auth";

const idParamSchema = z.string().min(1, "Invoice ID is required");

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    
    const { id: rawId } = await context.params;
    const parsed = idParamSchema.safeParse(rawId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }
    const id = parsed.data;
    const invoice = store.getInvoice(id, user.role, user.clientId);
    
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return handleApiError(error);
  }
}
