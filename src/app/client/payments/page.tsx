"use client";

import React from "react";
import useSWR from "swr";
import { Invoice } from "@/types/invoice";
import { InvoiceTable } from "@/features/invoices/InvoiceTable";
import { Loader2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function ClientPaymentsPage() {
  const { data: invoices, error, isLoading } = useSWR<Invoice[]>("/api/invoices", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  const isDataLoading = isLoading && !invoices;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 text-center">
        <h3 className="font-bold text-lg">Error loading payments history</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Filter settled/paid invoices
  const paidInvoices = invoices
    ? invoices.filter((inv) => inv.status === "paid")
    : [];

  const sortedPaidInvoices = [...paidInvoices].sort(
    (a, b) => new Date(b.paidAt || b.issuedDate).getTime() - new Date(a.paidAt || a.issuedDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payment Transactions
        </h1>
        <p className="text-sm text-slate-500">
          List of settled receipts and transaction confirmations
        </p>
      </div>

      {/* Invoice Table Grid */}
      {!isDataLoading && sortedPaidInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No settled transactions</h3>
          <p className="text-sm text-slate-500 mt-1">Submit invoice payments to generate receipts.</p>
        </div>
      ) : (
        <InvoiceTable 
          invoices={sortedPaidInvoices} 
          viewPathPrefix="/client/invoices"
          showClientColumn={false}
          isLoading={isDataLoading}
        />
      )}
    </div>
  );
}
