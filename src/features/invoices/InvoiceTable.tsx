import React from "react";
import Link from "next/link";
import { Invoice } from "@/types/invoice";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, FileText } from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  viewPathPrefix: "/admin/invoices" | "/client/invoices";
  showClientColumn?: boolean;
  isLoading?: boolean;
}

export const InvoiceTable = ({ 
  invoices, 
  viewPathPrefix, 
  showClientColumn = true,
  isLoading = false
}: InvoiceTableProps) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Invoice #
                </th>
                {showClientColumn && (
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Client
                  </th>
                )}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Due Date
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="hover:bg-slate-50/10">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 w-24 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  {showClientColumn && (
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="h-4 w-32 bg-slate-100 rounded mb-1.5 shimmer-bg animate-shimmer" />
                      <div className="h-3.5 w-44 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                    </td>
                  )}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 w-16 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-6 w-16 bg-slate-100 rounded-full shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 w-20 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="h-4 w-16 bg-slate-100 rounded ml-auto shimmer-bg animate-shimmer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">No invoices</h3>
        <p className="mt-1 text-sm text-slate-500">There are no invoices matching this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Invoice #
              </th>
              {showClientColumn && (
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Client
                </th>
              )}
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Amount
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Due Date
              </th>
              <th className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="group hover:bg-slate-50/40 transition-colors duration-150"
              >
                {/* Invoice Number */}
                <td className="relative px-6 py-5 text-sm font-medium text-slate-900 whitespace-nowrap">
                  {/* Hover Left Indicator line */}
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center" />
                  {invoice.number}
                </td>
                
                {/* Client Details */}
                {showClientColumn && (
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-950">
                      {invoice.clientName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {invoice.clientEmail}
                    </div>
                  </td>
                )}

                {/* Amount */}
                <td className="px-6 py-5 text-sm font-bold text-slate-900 whitespace-nowrap">
                  {formatCurrency(invoice.total)}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <StatusBadge status={invoice.status} />
                </td>

                {/* Due Date */}
                <td className="px-6 py-5 text-sm text-slate-500 whitespace-nowrap">
                  {formatDate(invoice.dueDate)}
                </td>

                {/* Action Link */}
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <Link
                    href={`${viewPathPrefix}/${invoice.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InvoiceTable;
