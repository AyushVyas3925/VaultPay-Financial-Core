"use client";

import React, { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, AlertCircle, Lock, X } from "lucide-react";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface InnerPayFormProps {
  invoiceId: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const getCardLogo = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa":
      return (
        <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 tracking-wider select-none animate-in fade-in duration-300">
          VISA
        </span>
      );
    case "mastercard":
      return (
        <span className="text-[9px] font-black text-red-500 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 tracking-wider select-none animate-in fade-in duration-300">
          MC
        </span>
      );
    case "amex":
      return (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 tracking-wider select-none animate-in fade-in duration-300">
          AMEX
        </span>
      );
    default:
      return <CreditCard className="h-4.5 w-4.5 text-slate-400 animate-in fade-in duration-300" />;
  }
};

const getCardLogoLarge = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa":
      return <span className="font-sans font-black text-xl italic text-white tracking-wide select-none animate-in fade-in duration-300">VISA</span>;
    case "mastercard":
      return (
        <div className="flex items-center -space-x-1.5 select-none animate-in fade-in duration-300">
          <div className="w-5.5 h-5.5 rounded-full bg-red-500 opacity-90 shadow-sm" />
          <div className="w-5.5 h-5.5 rounded-full bg-amber-500 opacity-90 shadow-sm" />
        </div>
      );
    case "amex":
      return <span className="font-sans font-bold text-xs bg-cyan-600 border border-cyan-400 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-sm select-none animate-in fade-in duration-300">AMEX</span>;
    default:
      return <CreditCard className="h-5 w-5 text-slate-400 animate-in fade-in duration-300" />;
  }
};

const InnerPayForm = ({ invoiceId, amount, onSuccess, onClose }: InnerPayFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>("unknown");
  const [cardholderName, setCardholderName] = useState("");

  const processingRef = useRef(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (processingRef.current) return;
    if (!stripe || !elements) {
      setError("Payment provider is not ready. Please refresh the page.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    processingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate transaction");
      }

      const { clientSecret } = await res.json();

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName || undefined,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || "Card confirmation failed");
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error("Payment transaction was not completed successfully.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected transaction error occurred.");
      processingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && !paymentSuccess) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative flex flex-col animate-in zoom-in-95 duration-200 text-left">
        <div className="flex justify-between items-center mb-5 border-b border-slate-200/80 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Secure Checkout</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vaultpay Billing Gateway</p>
          </div>
          {!loading && !paymentSuccess && (
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {paymentSuccess ? (
          <div className="rounded-xl border border-emerald-250 bg-emerald-50/50 p-6 text-center space-y-3 my-2">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="4">
                <circle cx="26" cy="26" r="23" stroke="currentColor" strokeDasharray="150" strokeDashoffset="150" className="animate-draw-circle" />
                <path d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" className="animate-draw-check" style={{ animationDelay: "0.25s" }} />
              </svg>
            </div>
            <h4 className="font-extrabold text-emerald-800 tracking-tight text-sm">Payment Succeeded!</h4>
            <p className="text-xs text-emerald-600">Your billing receipt is synchronized. Loading details...</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="relative h-44 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 shadow-xl text-white overflow-hidden select-none">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-200/50 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-x-2 inset-y-1 border border-amber-600/20 rounded-xs" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-600/20" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-600/20" />
                  </div>
                  <svg className="w-5 h-5 text-slate-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <div className="h-6 flex items-center">
                  {getCardLogoLarge(cardBrand)}
                </div>
              </div>

              <div className="mt-6 relative z-10">
                <div className="font-mono text-lg tracking-widest text-slate-100 drop-shadow-sm">
                  {cardBrand === "unknown" ? "•••• •••• •••• ••••" : `•••• •••• •••• ${cardBrand.toUpperCase()}`}
                </div>
              </div>

              <div className="mt-5 flex justify-between items-end relative z-10">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Cardholder Name</span>
                  <span className="block text-xs font-semibold tracking-wide text-slate-200 uppercase truncate max-w-[180px]">
                    {cardholderName || "Valued Client"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expires</span>
                  <span className="block text-xs font-mono font-semibold tracking-wide text-slate-200">
                    MM/YY
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Card Details
                </label>
                <div className="py-3 px-3.5 bg-white flex items-center justify-between border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <CardElement
                      onChange={(e) => {
                        setCardBrand(e.brand || "unknown");
                      }}
                      options={{
                        style: {
                          base: {
                            fontSize: "14px",
                            color: "#0f172a",
                            fontFamily: "Inter, sans-serif",
                            "::placeholder": {
                              color: "#94a3b8",
                            },
                          },
                          invalid: {
                            color: "#ef4444",
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="ml-3 shrink-0">
                    {getCardLogo(cardBrand)}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200/50 p-3.5 text-xs text-red-700 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !stripe}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-75 focus:outline-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4.5 w-4.5" />
                  <span>Pay {formatCurrency(amount)}</span>
                </>
              )}
            </button>

            <span className="block text-center text-[10px] text-slate-400 font-mono">
              Test Card: 4242 4242 4242 4242 | Exp: 12/28 | CVC: 123
            </span>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400 font-semibold">
              <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Encrypted using 256-bit SSL connection. Handled by Stripe (PCI-DSS compliant).</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface PayButtonProps {
  invoiceId: string;
  amount: number;
  onSuccess: () => void;
}

export const PayButton = ({ invoiceId, amount, onSuccess }: PayButtonProps) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    if (!stripePromise) {
      return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold px-4 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Payment service is not configured.
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise}>
        <InnerPayForm
          invoiceId={invoiceId}
          amount={amount}
          onSuccess={() => {
            onSuccess();
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      </Elements>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none cursor-pointer"
    >
      <CreditCard className="h-4.5 w-4.5" />
      Pay Invoice
    </button>
  );
};
export default PayButton;
