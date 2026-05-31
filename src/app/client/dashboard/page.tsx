"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { Invoice } from "@/types/invoice";
import { StatCard } from "@/features/invoices/StatCard";
import { InvoiceTable } from "@/features/invoices/InvoiceTable";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ArrowRight 
} from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function ClientDashboardPage() {
  // SWR Polling every 2 seconds for real-time dashboard state updates
  const { data: invoices, error, isLoading } = useSWR<Invoice[]>("/api/invoices", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate client metrics dynamically
  const calculateMetrics = () => {
    if (!invoices || !Array.isArray(invoices)) {
      return { outstanding: 0, paidTotal: 0, totalCount: 0 };
    }

    let outstanding = 0;
    let paidTotal = 0;

    invoices.forEach((inv) => {
      if (inv.status === "paid") {
        paidTotal += inv.total;
      } else {
        outstanding += inv.total;
      }
    });

    return {
      outstanding,
      paidTotal,
      totalCount: invoices.length,
    };
  };

  const { outstanding, paidTotal, totalCount } = calculateMetrics();

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
        <h3 className="font-bold text-lg">Error loading client dashboard</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Filter outstanding/unpaid invoices
  const unpaidInvoices = invoices
    ? invoices.filter((inv) => inv.status !== "paid")
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Billing Account Overview
        </h1>
        <p className="text-sm text-slate-500">
          Manage outstanding invoice balances and review past transactions
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(outstanding)}
          icon={Clock}
          subtext="Unpaid invoice bills"
        />
        <StatCard
          label="Paid Total"
          value={formatCurrency(paidTotal)}
          icon={DollarSign}
          subtext="Settled contract value"
        />
        <StatCard
          label="Total Invoices"
          value={totalCount}
          icon={CheckCircle2}
          subtext="Cumulative invoices"
        />
      </div>

      {/* Unpaid Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Outstanding Invoices
          </h3>
          <Link 
            href="/client/invoices" 
            className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 transition-colors"
          >
            Billing History
          </Link>
        </div>

        <InvoiceTable 
          invoices={unpaidInvoices} 
          viewPathPrefix="/client/invoices"
          showClientColumn={false} // Don't show Client column since client is viewing their own dashboard
        />
      </div>
    </div>
  );
}
