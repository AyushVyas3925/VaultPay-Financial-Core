"use client";

import React from "react";
import { Shell } from "@/features/shell/Shell";
import { AdminGuard } from "@/features/auth/guards";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <Shell>{children}</Shell>
    </AdminGuard>
  );
}
