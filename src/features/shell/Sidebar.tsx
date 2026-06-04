"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  X,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ isOpen, setIsOpen, isCollapsed = false, onToggleCollapse }: SidebarProps) => {
  const pathname = usePathname();
  const { role, isAdmin, isClient } = useAuth();

  const adminMenu = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Invoices", href: "/admin/invoices", icon: FileText },
  ];

  const clientMenu = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "My Invoices", href: "/client/invoices", icon: FileText },
    { label: "Payments", href: "/client/payments", icon: CreditCard },
  ];

  const menuItems = isAdmin ? adminMenu : isClient ? clientMenu : [];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm shrink-0">
              VP
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg tracking-tight text-slate-900 transition-all duration-300">
                Vault<span className="text-blue-600">Pay</span>
              </span>
            )}
          </Link>

          {!isOpen && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-slate-100 shadow-xs cursor-pointer focus:outline-none transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}


          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        <div className={`flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50 ${isCollapsed ? "justify-center" : "justify-start"
          }`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
            {role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {role === "admin" ? "Admin Portal" : "Client Portal"}
              </h4>
              <p className="text-xs text-slate-500 capitalize">{role} Account</p>
            </div>
          )}
        </div>


        <nav className="relative flex-1 px-4 py-6 space-y-1">
          {/* Animated sliding active pill indicator */}
          {menuItems.findIndex((item) => pathname === item.href) !== -1 && (
            <div
              className="absolute h-11 rounded-lg bg-blue-50 border-l-3 border-blue-600 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateY(${menuItems.findIndex((item) => pathname === item.href) * 48}px)`,
                top: "24px",
                left: isCollapsed ? "8px" : "16px",
                right: isCollapsed ? "8px" : "16px",
              }}
            />
          )}

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`group relative flex h-11 items-center gap-3 px-3 rounded-lg text-sm transition-all duration-200 ${isCollapsed ? "justify-center" : "justify-start"
                  } ${isActive
                    ? "text-blue-700 font-bold"
                    : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>


        <div className="p-4 border-t border-slate-100 text-center truncate">
          <span className="text-xs text-slate-400">
            {isCollapsed ? "VP" : "Vaultpay Corporate Services"}
          </span>
        </div>
      </aside>
    </>
  );
};
