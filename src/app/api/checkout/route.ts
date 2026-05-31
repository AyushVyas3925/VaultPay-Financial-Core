import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { store } from "@/lib/store";
import { requireClient } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-01-27.acacia" as any
});

// POST /api/checkout - Create a Stripe PaymentIntent for an invoice
export async function POST(req: NextRequest) {
  try {
    // Validate Layer 2: Must be Client to pay invoices
    const session = await requireClient();
    const user = session.user as any;

    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    // Retrieve invoice through ownership-aware Layer 3 queries
    const invoice = store.getInvoice(invoiceId, user.role, user.clientId);
    if (!invoice) {
      // 404 to avoid leaking invoice existence (IDOR protection)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    // Handle mock keys for initial local developer testing
    if (stripeKey === "sk_test_placeholder" || !stripeKey) {
      console.warn("Using placeholder Stripe key. Returning simulated secret.");
      return NextResponse.json({
        clientSecret: "mock_secret_" + invoice.id + "_" + Date.now(),
        isMock: true
      });
    }

    // Create Stripe PaymentIntent. Stripe expects amounts in cents.
    const amountInCents = Math.round(invoice.total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        clientId: invoice.clientId,
      },
      receipt_email: invoice.clientEmail,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      isMock: false
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    if (error.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
