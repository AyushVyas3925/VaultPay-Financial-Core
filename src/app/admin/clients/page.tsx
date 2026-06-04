"use client";

import React from "react";
import useSWR from "swr";
import { ClientSummary } from "@/types/invoice";
import { Users, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function AdminClientsPage() {
  const { data: clients, error, isLoading } = useSWR<ClientSummary[]>("/api/clients", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading && !clients) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 text-center">
        <h3 className="font-bold text-lg">Error loading clients list</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Client Contracts
        </h1>
        <p className="text-sm text-slate-500">
          List of B2B client organizations and cumulative billings
        </p>
      </div>


      {!clients || clients.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No clients found</h3>
          <p className="text-sm text-slate-500 mt-1">Add client users in the store seed files to populate.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Billing Contact Email
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                    Total Invoices
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                    Total Billed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-center whitespace-nowrap">
                      {client.invoiceCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right whitespace-nowrap">
                      {formatCurrency(client.totalBilled)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
