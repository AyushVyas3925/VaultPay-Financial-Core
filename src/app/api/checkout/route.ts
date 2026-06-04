import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { store } from "@/lib/store";
import { requireClient } from "@/lib/auth";

const checkoutSchema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeKey || stripeKey === "sk_test_placeholder") {
  console.error("STRIPE_SECRET_KEY is not configured for checkout.");
}

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-01-27.acacia" as unknown as never
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireClient();
    const user = session.user;
    if (!user || !user.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { invoiceId } = parsed.data;

    const invoice = store.getInvoice(invoiceId, user.role, user.clientId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    if (!stripeKey || stripeKey === "sk_test_placeholder") {
      return NextResponse.json(
        { error: "Payment service is not configured. Contact the administrator." },
        { status: 503 }
      );
    }

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
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Stripe Checkout Error:", err);
    if (err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
