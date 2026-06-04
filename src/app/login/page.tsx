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
        router.refresh();
      }
    } catch {
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -left-12 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-blue-600/20 blur-[80px] sm:blur-[110px] animate-blob-float-1 animate-blob-spin" />

        <div className="absolute -bottom-20 -right-20 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-indigo-500/15 blur-[100px] sm:blur-[130px] animate-blob-float-2 animate-blob-spin" style={{ animationDirection: "reverse" }} />

        <div className="absolute top-1/3 right-1/4 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-slate-400/10 blur-[70px] sm:blur-[100px] animate-blob-float-1" />
      </div>

      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-2xl shadow-lg hover:scale-105 transition-transform duration-300">
            VP
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to VaultPay
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Vaultpay Corporate Services Billing Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-red-950/40 border border-red-500/20 p-4 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Vault@Vaultpay.com"
                className="block w-full rounded-lg border border-white/10 pl-10.5 pr-4 py-2.5 text-sm bg-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-white/10 pl-10.5 pr-4 py-2.5 text-sm bg-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-75 focus:outline-none cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Demo Credentials
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials("Vault@Vaultpay.com", "admin123")}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-purple-500/10 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all duration-300 text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-purple-400">Admin Login</span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">Vault@Vaultpay.com</span>
            </button>

            <button
              onClick={() => fillCredentials("sarah@meridian.com", "client123")}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all duration-300 text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-blue-400">Client Login</span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">sarah@meridian.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

