import React from "react";
import { Invoice } from "@/types/invoice";
import { StatusBadge } from "./StatusBadge";
import { DownloadPDFButton } from "./DownloadPDFButton";
import { PayButton } from "@/features/checkout/PayButton";
import { Mail, MapPin } from "lucide-react";

interface InvoiceDetailViewProps {
  invoice: Invoice;
  viewerRole: "admin" | "client";
  onPaymentSuccess: () => void;
}

export const InvoiceDetailView = ({ 
  invoice, 
  viewerRole, 
  onPaymentSuccess 
}: InvoiceDetailViewProps) => {

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

  const showPaymentButton = viewerRole === "client" && invoice.status !== "paid";

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-900">
            {invoice.number}
          </h1>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download PDF button */}
          <DownloadPDFButton invoiceId={invoice.id} invoiceNumber={invoice.number} />

          {/* Inline payment element trigger */}
          {showPaymentButton && (
            <PayButton 
              invoiceId={invoice.id} 
              amount={invoice.total} 
              onSuccess={onPaymentSuccess} 
            />
          )}
        </div>
      </div>

      {/* Invoice Document Layout */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-10 space-y-10">
        
        {/* Vendor and Client Headers */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Vendor Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
                N
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">
                Nexus Corporate Services
              </span>
            </div>
            <div className="text-sm text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                100 Broadway, 24th Floor, New York, NY 10005
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                billing@nexus.com
              </p>
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-3 md:text-right">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Billed To:
            </h4>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 text-base">
                {invoice.clientName}
              </h5>
              <p className="text-sm text-slate-500 flex items-center justify-end gap-1.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                {invoice.clientEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Dates Meta */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Invoice Date
            </span>
            <span className="font-semibold text-slate-900">{formatDate(invoice.issuedDate)}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Due Date
            </span>
            <span className="font-semibold text-slate-900">{formatDate(invoice.dueDate)}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </span>
            <span className="font-semibold text-slate-900 capitalize">{invoice.status}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Payment Date
            </span>
            <span className="font-semibold text-slate-900">
              {invoice.paidAt ? formatDate(invoice.paidAt) : "N/A"}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Unit Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.quantity * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations Block */}
        <div className="flex flex-col items-end space-y-3 pt-6 border-t border-slate-100">
          <div className="flex w-64 justify-between text-sm text-slate-500">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex w-64 justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
            <span>Invoice Total:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default InvoiceDetailView;
