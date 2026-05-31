"use client";

import React, { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, AlertCircle, Lock } from "lucide-react";

// Initialize Stripe Promise
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey !== "pk_test_placeholder" && stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface InnerPayFormProps {
  invoiceId: string;
  amount: number;
  onSuccess: () => void;
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

const InnerPayForm = ({ invoiceId, amount, onSuccess }: InnerPayFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>("unknown");
  
  // Custom mock inputs to prevent stripe-elements-crash
  const [mockCardNumber, setMockCardNumber] = useState("");
  const [mockExpiry, setMockExpiry] = useState("");
  const [mockCvc, setMockCvc] = useState("");

  // Double-submit prevention guard
  const processingRef = useRef(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const isMockMode = !stripePublishableKey || stripePublishableKey === "pk_test_placeholder";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (processingRef.current) return;
    
    // Acquire elements check
    if (isMockMode) {
      // DEV MODE / MOCK BYPASS: Trigger simulated payment when credentials are missing
      processingRef.current = true;
      setLoading(true);
      
      try {
        const checkRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId }),
        });
        
        if (!checkRes.ok) {
          const errData = await checkRes.json();
          throw new Error(errData.error || "Checkout validation failed");
        }

        // Send mock success webhook update directly to backend
        const mockWebhookRes = await fetch("/api/webhooks/stripe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "stripe-signature": "mock_signature",
          },
          body: JSON.stringify({ invoiceId }),
        });

        if (!mockWebhookRes.ok) {
          throw new Error("Failed to trigger mock webhook state synchronization");
        }

        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dev payment mock failure");
      } finally {
        setLoading(false);
        processingRef.current = false;
      }
      return;
    }

    if (!stripe || !elements) {
      return; // Stripe SDK not fully loaded
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    processingRef.current = true;
    setLoading(true);

    try {
      // Step 1: Create PaymentIntent on backend API
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

      // Step 2: Confirm card payment in frontend
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || "Card confirmation failed");
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
        // Fire success callback after showing confirmation animation
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

  if (paymentSuccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
        {/* Animated Drawing SVG Checkmark (Satisfying Dopamine Effect) */}
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="4">
            <circle cx="26" cy="26" r="23" stroke="currentColor" strokeDasharray="150" strokeDashoffset="150" className="animate-draw-circle" />
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" className="animate-draw-check" style={{ animationDelay: "0.25s" }} />
          </svg>
        </div>
        <h4 className="font-extrabold text-emerald-800 tracking-tight">Payment Succeeded!</h4>
        <p className="text-xs text-emerald-600">Your billing receipt is synchronized. Loading details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Credit or Debit Card
        </label>
        
        {isMockMode ? (
          <div className="space-y-3">
            {/* Mock Card Input Field with autodetect logo inside */}
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Card number (e.g. 4242 4242 4242 4242)"
                value={mockCardNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\s+/g, "");
                  setMockCardNumber(raw.replace(/(\d{4})/g, "$1 ").trim());
                  
                  // Autodetect card brand
                  if (raw.startsWith("4")) {
                    setCardBrand("visa");
                  } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
                    setCardBrand("mastercard");
                  } else if (/^(3[47])/.test(raw)) {
                    setCardBrand("amex");
                  } else if (raw === "") {
                    setCardBrand("unknown");
                  } else {
                    setCardBrand("other");
                  }
                }}
                maxLength={19}
                className="block w-full rounded-lg border border-slate-200 pl-3.5 pr-14 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {getCardLogo(cardBrand)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="MM / YY"
                value={mockExpiry}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s+/g, "");
                  setMockExpiry(val);
                }}
                maxLength={5}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <input
                type="password"
                required
                placeholder="CVC"
                value={mockCvc}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setMockCvc(val);
                }}
                maxLength={4}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="py-2.5 px-1 bg-white flex items-center justify-between border border-slate-100 rounded-lg">
            {/* Inline CardElement styled to match white theme */}
            <div className="flex-1">
              <CardElement
                onChange={(e) => {
                  setCardBrand(e.brand || "unknown");
                }}
                options={{
                  style: {
                    base: {
                      fontSize: "14px",
                      color: "#0f172a", // Slate 900
                      fontFamily: "Inter, sans-serif",
                      "::placeholder": {
                        color: "#94a3b8", // Slate 400
                      },
                    },
                    invalid: {
                      color: "#ef4444", // Red 500
                    },
                  },
                }}
              />
            </div>
            <div className="ml-3 shrink-0">
              {getCardLogo(cardBrand)}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200/50 p-3.5 text-xs text-red-700 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        type="submit"
        disabled={loading}
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
        Test Card Hint: 4242 4242 4242 4242 | Expiry: 12/28 | CVC: 123
      </span>

      {/* Explicit Security Signatures (Trust UX Indicator) */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400 font-semibold">
        <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>Encrypted using 256-bit SSL connection. Handled by Stripe (PCI-DSS compliant).</span>
      </div>
    </form>
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
    // If publishable key is missing, load elements in mockup form bypass mode
    if (!stripePromise) {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold">
            Running in local mock payment mode. Card Element simulated.
          </div>
          <InnerPayForm invoiceId={invoiceId} amount={amount} onSuccess={onSuccess} />
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise}>
        <InnerPayForm invoiceId={invoiceId} amount={amount} onSuccess={onSuccess} />
      </Elements>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none"
    >
      <CreditCard className="h-4.5 w-4.5" />
      Pay Invoice
    </button>
  );
};
export default PayButton;
