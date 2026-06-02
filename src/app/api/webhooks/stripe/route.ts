import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { store } from "@/lib/store";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

if (!stripeKey || stripeKey === "sk_test_placeholder") {
  console.error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-01-27.acacia" as unknown as never
});

export async function POST(req: NextRequest) {
  if (!webhookSecret || webhookSecret === "whsec_placeholder") {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook service is not configured. Contact the administrator." },
      { status: 503 }
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

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

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const invoiceId = paymentIntent.metadata.invoiceId;
    
    if (invoiceId) {
      store.markPaid(invoiceId);
    }
  }

  return NextResponse.json({ received: true });
}
