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
  Plus, 
  Loader2 
} from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function AdminDashboardPage() {
  // SWR polling configured for real-time synchronization every 2 seconds
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

  // Calculate metrics dynamically from in-memory invoice records
  const calculateMetrics = () => {
    if (!invoices || !Array.isArray(invoices)) {
      return { totalRevenue: 0, outstanding: 0, paidCount: 0, activeClients: 0, aging1to30: 0, aging31to60: 0, aging60plus: 0 };
    }

    let totalRevenue = 0;
    let outstanding = 0;
    let paidCount = 0;
    const clientIds = new Set<string>();
    
    let aging1to30 = 0;
    let aging31to60 = 0;
    let aging60plus = 0;

    const today = new Date();

    invoices.forEach((inv) => {
      clientIds.add(inv.clientId);
      if (inv.status === "paid") {
        totalRevenue += inv.total;
        paidCount++;
      } else {
        outstanding += inv.total;
        
        // Calculate aging categories if overdue
        if (inv.status === "overdue") {
          const due = new Date(inv.dueDate + "T00:00:00");
          const diffTime = Math.abs(today.getTime() - due.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 30) {
            aging1to30 += inv.total;
          } else if (diffDays <= 60) {
            aging31to60 += inv.total;
          } else {
            aging60plus += inv.total;
          }
        }
      }
    });

    return {
      totalRevenue,
      outstanding,
      paidCount,
      activeClients: clientIds.size,
      aging1to30,
      aging31to60,
      aging60plus,
    };
  };

  const { 
    totalRevenue, 
    outstanding, 
    paidCount, 
    activeClients,
    aging1to30,
    aging31to60,
    aging60plus 
  } = calculateMetrics();

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
      {/* Header and Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Nexus Corporate Services Billing Overview
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

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          subtext="Processed payments"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(outstanding)}
          icon={Clock}
          subtext="Pending and overdue collections"
        />
        <StatCard
          label="Paid Invoices"
          value={paidCount}
          icon={CheckCircle2}
          subtext="Settled invoice receipts"
        />
        <StatCard
          label="Active Clients"
          value={activeClients}
          icon={Users}
          subtext="Corporate client contracts"
        />
      </div>

      {/* Overdue Accounts Receivables Aging Analysis */}
      {outstanding > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Overdue Accounts Receivables Aging Analysis
            </h4>
          </div>
          <div className="grid gap-4 grid-cols-3 text-center">
            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">1 - 30 Days</span>
              <span className="text-base font-bold text-amber-600">{formatCurrency(aging1to30)}</span>
            </div>
            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">31 - 60 Days</span>
              <span className="text-base font-bold text-orange-500">{formatCurrency(aging31to60)}</span>
            </div>
            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">60+ Days</span>
              <span className="text-base font-bold text-red-600">{formatCurrency(aging60plus)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Invoices List */}
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
        />
      </div>
    </div>
  );
}
