"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Invoice } from "@/types/invoice";
import { StatCard } from "@/features/invoices/StatCard";
import { InvoiceTable } from "@/features/invoices/InvoiceTable";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  Plus
} from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function AdminDashboardPage() {
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

  const calculateMetrics = () => {
    if (!invoices || !Array.isArray(invoices)) {
      return { totalRevenue: 0, outstanding: 0, paidCount: 0, activeClients: 0 };
    }

    let totalRevenue = 0;
    let outstanding = 0;
    let paidCount = 0;
    const clientIds = new Set<string>();

    invoices.forEach((inv) => {
      clientIds.add(inv.clientId);
      if (inv.status === "paid") {
        totalRevenue += inv.total;
        paidCount++;
      } else {
        outstanding += inv.total;
      }
    });

    return {
      totalRevenue,
      outstanding,
      paidCount,
      activeClients: clientIds.size,
    };
  };

  const {
    totalRevenue,
    outstanding,
    paidCount,
    activeClients
  } = calculateMetrics();

  const isDataLoading = isLoading && !invoices;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 text-center">
        <h3 className="font-bold text-lg">Error loading dashboard</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const sortedInvoices = invoices ? [...invoices].sort(
    (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
  ) : [];

  const recentInvoices = sortedInvoices.slice(0, 5);

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Vaultpay Corporate Services Billing Overview
          </p>
        </div>

        <div>
          <Link
            href="/admin/invoices/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Invoice
          </Link>
        </div>
      </div>


      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={isDataLoading ? "..." : formatCurrency(totalRevenue)}
          icon={DollarSign}
          subtext="Processed payments"
        />
        <StatCard
          label="Outstanding Balance"
          value={isDataLoading ? "..." : formatCurrency(outstanding)}
          icon={Clock}
          subtext="Pending and overdue collections"
        />
        <StatCard
          label="Paid Invoices"
          value={isDataLoading ? "..." : paidCount}
          icon={CheckCircle2}
          subtext="Settled invoice receipts"
        />
        <StatCard
          label="Active Clients"
          value={isDataLoading ? "..." : activeClients}
          icon={Users}
          subtext="Corporate client contracts"
        />
      </div>




      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Recent Invoices
          </h3>
          <Link
            href="/admin/invoices"
            className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 transition-colors"
          >
            View All Invoices
          </Link>
        </div>

        <InvoiceTable
          invoices={recentInvoices}
          viewPathPrefix="/admin/invoices"
          isLoading={isDataLoading}
        />
      </div>
    </div>
  );
}
