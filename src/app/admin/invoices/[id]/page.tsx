"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { InvoiceDetailView } from "@/features/invoices/InvoiceDetailView";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Invoice } from "@/types/invoice";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => {
  if (!res.ok) throw new Error("Invoice not found");
  return res.json();
});

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: invoice, error, mutate } = useSWR<Invoice>(
    id ? `/api/invoices/${id}` : null,
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true
    }
  );

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 text-center">
          <h3 className="font-bold text-lg">Invoice not found</h3>
          <p className="text-sm mt-1">The requested invoice could not be located or you lack permissions to view it.</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      <InvoiceDetailView
        invoice={invoice}
        viewerRole="admin"
        onPaymentSuccess={() => mutate()}
      />
    </div>
  );
}
