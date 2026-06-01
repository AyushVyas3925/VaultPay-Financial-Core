"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Invoice } from "@/types/invoice";
import { Search, Loader2, FileText, ArrowRight, CornerDownLeft } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewerRole: "admin" | "client";
}

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export const SearchModal = ({ isOpen, onClose, viewerRole }: SearchModalProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: invoices, isLoading } = useSWR<Invoice[]>(
    isOpen ? "/api/invoices" : null,
    fetcher
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
        setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredInvoices = invoices
    ? invoices.filter((inv) => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        
        const matchNum = inv.number.toLowerCase().includes(q);
        const matchClient = inv.clientName.toLowerCase().includes(q);
        const matchItems = inv.lineItems.some((item) =>
          item.description.toLowerCase().includes(q)
        );
        return matchNum || matchClient || matchItems;
      }).slice(0, 8)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredInvoices.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredInvoices.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredInvoices.length) % filteredInvoices.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredInvoices[selectedIndex]);
    }
  };

  const handleSelect = (invoice: Invoice) => {
    const prefix = viewerRole === "admin" ? "/admin/invoices" : "/client/invoices";
    router.push(`${prefix}/${invoice.id}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Input Bar */}
        <div className="relative border-b border-slate-800/80 flex items-center">
          <Search className="h-5 w-5 text-slate-500 absolute left-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search invoice number, client name, or deliverables..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-0 pl-12 pr-16 py-4.5 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
          />
          <div className="absolute right-4 flex items-center gap-1.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-sans font-medium uppercase shadow-sm">
              esc
            </kbd>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto max-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-xs">Indexing invoices registry...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-600 mt-1">Try searching by client name or exact INV invoice number.</p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredInvoices.map((inv, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={inv.id}
                    onClick={() => handleSelect(inv)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-sm transition-all duration-150 cursor-pointer ${
                      isSelected 
                        ? "bg-white/5 text-blue-400" 
                        : "text-slate-300 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{inv.number}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            inv.status === "paid" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : inv.status === "overdue"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {inv.clientName} &bull; {inv.lineItems[0]?.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(inv.total)}
                      </span>
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono font-medium">
                          <span>Enter</span>
                          <CornerDownLeft className="h-3 w-3" />
                        </div>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
