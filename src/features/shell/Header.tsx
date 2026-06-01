"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Menu, LogOut, User, Search } from "lucide-react";
import { SearchModal } from "./SearchModal";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user, role, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-6 shadow-xs lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:hidden focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h2 className="hidden text-sm font-semibold text-slate-400 lg:block uppercase tracking-wider">
            VaultPay Core
          </h2>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-xs font-semibold focus:outline-none transition-all duration-200 cursor-pointer shadow-xs"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search invoices...</span>
            <kbd className="ml-4 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[9px] text-slate-400 font-sans shadow-sm font-bold">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <h5 className="text-sm font-semibold text-slate-900">
                {user?.name || "System User"}
              </h5>
              <p className="text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <User className="h-4.5 w-4.5" />
            </div>

            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset uppercase tracking-wide ${
              role === "admin" 
                ? "bg-purple-50 text-purple-700 ring-purple-700/10" 
                : "bg-blue-50 text-blue-700 ring-blue-700/10"
            }`}>
              {role}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors focus:outline-none cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        viewerRole={role || "client"}
      />
    </>
  );
};
export default Header;

