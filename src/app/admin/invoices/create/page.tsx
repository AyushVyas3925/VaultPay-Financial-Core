"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ClientSummary } from "@/types/invoice";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

interface FormLineItem {
  description: string;
  quantity: number;
  rate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();

  // Load clients to populate dropdown
  const { data: clients, error } = useSWR<ClientSummary[]>("/api/clients", fetcher);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { description: "", quantity: 1, rate: 0 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculated totals in UI
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((acc, current) => acc + (current.quantity * current.rate), 0);
    const tax = Math.round(subtotal * 0.08875 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  // Handle adding line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  // Handle removing line item
  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Handle line item change
  const handleItemChange = (index: number, field: keyof FormLineItem, value: any) => {
    const updated = lineItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setLineItems(updated);
  };

  // Submit Invoice Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validations
    if (!selectedClientId) {
      setValidationError("Please select a client.");
      return;
    }
    if (!dueDate) {
      setValidationError("Please specify a due date.");
      return;
    }

    const client = clients?.find((c) => c.id === selectedClientId);
    if (!client) {
      setValidationError("Selected client not found.");
      return;
    }

    // Line item validations
    for (const item of lineItems) {
      if (!item.description.trim()) {
        setValidationError("All line items must have descriptions.");
        return;
      }
      if (item.quantity <= 0) {
        setValidationError("Line item quantities must be greater than 0.");
        return;
      }
      if (item.rate <= 0) {
        setValidationError("Line item rates must be greater than 0.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          dueDate,
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: Number(item.quantity),
            rate: Number(item.rate)
          }))
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create invoice");
      }

      // Successful invoice creation. Redirect to dashboard
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setValidationError(err.message || "An unexpected error occurred during submission.");
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          New Corporate Billing Invoice
        </h1>
        <p className="text-sm text-slate-500">
          Generate structured invoices with line item breakouts and automatic NY tax rules
        </p>
      </div>

      {validationError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-800">
          {validationError}
        </div>
      )}

      {/* Invoice Creation Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Client Contract
            </label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
            >
              <option value="">-- Choose Client --</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Payment Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Line Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Invoice Line Items
            </h4>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
            >
              <Plus className="h-4 w-4" />
              Add Item Row
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                {/* Description */}
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Consulting Services Description..."
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Quantity */}
                <div className="w-full sm:w-20">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Rate */}
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden">
                    Rate ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={item.rate || ""}
                    onChange={(e) => handleItemChange(index, "rate", Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Calculated Total for Row */}
                <div className="w-full sm:w-28 text-right font-semibold text-slate-900 text-sm py-2">
                  <span className="inline-block sm:hidden text-xs text-slate-400 font-normal mr-2">Row Total:</span>
                  {formatCurrency(item.quantity * item.rate)}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-100 hover:border-red-200 disabled:opacity-50 transition-colors focus:outline-none shrink-0"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col items-end pt-6 border-t border-slate-100 space-y-3">
          <div className="flex w-64 justify-between text-sm text-slate-500">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex w-64 justify-between text-sm text-slate-500">
            <span>Tax (8.875% NY):</span>
            <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex w-64 justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
            <span>Invoice Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-6">
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 hover:scale-[1.01] active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-75 focus:outline-none"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Generate Invoice"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
