import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { store } from "@/lib/store";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-01-27.acacia" as unknown as never
});

// POST /api/webhooks/stripe - Stripe Webhook listener
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Dev bypass fallback for local testing without Stripe CLI
  if (webhookSecret === "whsec_placeholder" && signature === "mock_signature") {
    try {
      const data = JSON.parse(payload);
      const invoiceId = data.invoiceId;
      if (invoiceId) {
        store.markPaid(invoiceId);
        return NextResponse.json({ received: true, mock: true });
      }
      return NextResponse.json({ error: "Missing invoiceId in mock payload" }, { status: 400 });
    } catch {
      return NextResponse.json({ error: "Invalid JSON in mock payload" }, { status: 400 });
    }
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown verification error";
    console.error("Webhook signature verification failed:", errorMsg);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const invoiceId = paymentIntent.metadata.invoiceId;
    
    if (invoiceId) {
      store.markPaid(invoiceId);
    }
  }

  return NextResponse.json({ received: true });
}
