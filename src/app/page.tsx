"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && role) {
        const target = role === "admin" ? "/admin/dashboard" : "/client/dashboard";
        router.replace(target);
      } else {
        router.replace("/login");
      }
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
