"use client";

import React from "react";
import useSWR from "swr";
import { Invoice } from "@/types/invoice";
import { InvoiceTable } from "@/features/invoices/InvoiceTable";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function ClientInvoicesPage() {
  const { data: invoices, error, isLoading } = useSWR<Invoice[]>("/api/invoices", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  if (isLoading && !invoices) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 text-center">
        <h3 className="font-bold text-lg">Error loading invoices</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const sortedInvoices = invoices ? [...invoices].sort(
    (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
  ) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Billing History
        </h1>
        <p className="text-sm text-slate-500">
          List of all invoices generated for your company contract
        </p>
      </div>

      {/* Invoice Table */}
      <InvoiceTable 
        invoices={sortedInvoices} 
        viewPathPrefix="/client/invoices"
        showClientColumn={false}
      />
    </div>
  );
}
