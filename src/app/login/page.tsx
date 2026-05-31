"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user && role) {
      const target = role === "admin" ? "/admin/dashboard" : "/client/dashboard";
      router.replace(target);
    }
  }, [user, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Successful login - Router will handle redirection via useEffect
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  if (authLoading || (user && role)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-8 shadow-xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-2xl shadow-md">
            VP
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to VaultPay
          </h2>
          <p className="text-sm text-slate-500">
            Nexus Corporate Services Billing Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200/50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="evelyn@nexus.com"
                className="block w-full rounded-lg border border-slate-200 pl-10.5 pr-4 py-2.5 text-sm bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-slate-200 pl-10.5 pr-4 py-2.5 text-sm bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-70 focus:outline-none"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Container */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 space-y-4">
          <span className="block text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            Demo Credentials
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* Admin Fill */}
            <button
              onClick={() => fillCredentials("evelyn@nexus.com", "admin123")}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
            >
              <span className="text-xs font-bold text-purple-700">Admin Login</span>
              <span className="text-[10px] text-purple-500 mt-1 font-mono">evelyn@nexus.com</span>
            </button>

            {/* Client Fill */}
            <button
              onClick={() => fillCredentials("sarah@meridian.com", "client123")}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
            >
              <span className="text-xs font-bold text-blue-700">Client Login</span>
              <span className="text-[10px] text-blue-500 mt-1 font-mono">sarah@meridian.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
