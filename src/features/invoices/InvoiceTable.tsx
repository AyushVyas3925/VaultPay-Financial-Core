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
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2.5">
            <thead>
              <tr className="text-slate-400">
                <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                  Invoice #
                </th>
                {showClientColumn && (
                  <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                    Client
                  </th>
                )}
                <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                  Due Date
                </th>
                <th className="relative px-6 pb-3 pt-1">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                    <div className="h-4 w-24 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  {showClientColumn && (
                    <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                      <div className="h-4 w-32 bg-slate-100 rounded mb-1.5 shimmer-bg animate-shimmer" />
                      <div className="h-3.5 w-44 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                    </td>
                  )}
                  <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                    <div className="h-4 w-16 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                    <div className="h-6 w-16 bg-slate-100 rounded-full shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                    <div className="h-4 w-20 bg-slate-100 rounded shimmer-bg animate-shimmer" />
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
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
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2.5 px-0.5">
          <thead>
            <tr className="text-slate-400">
              <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                Invoice #
              </th>
              {showClientColumn && (
                <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                  Client
                </th>
              )}
              <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 pb-3 pt-1 text-[10px] font-bold uppercase tracking-wider">
                Due Date
              </th>
              <th className="relative px-6 pb-3 pt-1">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="group bg-white hover:-translate-y-1 hover:shadow-md active:translate-y-0 transition-all duration-300 ease-out cursor-pointer relative hover:z-10"
              >
                <td className="relative px-6 py-5 text-sm font-medium text-slate-900 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center" />
                  {invoice.number}
                </td>
                {showClientColumn && (
                  <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                    <div className="text-sm font-medium text-slate-950">
                      {invoice.clientName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {invoice.clientEmail}
                    </div>
                  </td>
                )}
                <td className="px-6 py-5 text-sm font-bold text-slate-900 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap border-y border-slate-200/80 first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl">
                  <Link
                    href={`${viewPathPrefix}/${invoice.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 text-xs font-semibold text-slate-700 px-3.5 py-1.5 shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform duration-200" />
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
