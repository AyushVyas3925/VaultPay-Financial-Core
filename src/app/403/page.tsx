"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const { role } = useAuth();
  
  // Resolve back-to-dashboard redirect targets dynamically based on role
  const dashboardHref = role === "admin" ? "/admin/dashboard" : "/client/dashboard";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Guard Lock Icon */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            403 - Access Denied
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            You do not have the required permissions to access this page. This transaction is monitored.
          </p>
        </div>

        {/* Action button */}
        <div>
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 shadow-md transition-colors focus:outline-none"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
