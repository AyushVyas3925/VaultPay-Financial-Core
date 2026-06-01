"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Invoice } from "@/types/invoice";
import { InvoiceTable } from "@/features/invoices/InvoiceTable";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function AdminInvoicesPage() {
  const { data: invoices, error, isLoading } = useSWR<Invoice[]>("/api/invoices", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  const isDataLoading = isLoading && !invoices;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoices Master Registry
          </h1>
          <p className="text-sm text-slate-500">
            View, track, and generate corporate billing invoices
          </p>
        </div>

        <div>
          <Link
            href="/admin/invoices/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 shadow-md transition-colors focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Invoice
          </Link>
        </div>
      </div>

      <InvoiceTable 
        invoices={sortedInvoices} 
        viewPathPrefix="/admin/invoices" 
        isLoading={isDataLoading}
      />
    </div>
  );
}
