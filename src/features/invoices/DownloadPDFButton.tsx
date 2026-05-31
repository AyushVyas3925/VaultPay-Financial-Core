"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadPDFButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

export const DownloadPDFButton = ({ invoiceId, invoiceNumber }: DownloadPDFButtonProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Fetch binary PDF data from API
      const res = await fetch(`/api/pdf/${invoiceId}`, {
        method: "GET",
        headers: {
          // Send no-cache to force live render
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Native anchor trigger
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Memory cleanup: remove link and revoke blob
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download Error:", err);
      alert("Could not download invoice PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2.5 shadow-xs transition-colors disabled:opacity-75 focus:outline-none shrink-0"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <Download className="h-4.5 w-4.5" />
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
};
export default DownloadPDFButton;
