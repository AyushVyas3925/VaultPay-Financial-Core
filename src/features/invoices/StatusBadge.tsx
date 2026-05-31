import React from "react";
import { InvoiceStatus } from "@/types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    overdue: "bg-red-50 text-red-700 ring-red-600/20",
  };

  const labels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wider ${
      styles[status] || styles.pending
    }`}>
      {labels[status] || status}
    </span>
  );
};
export default StatusBadge;
