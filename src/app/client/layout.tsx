"use client";

import React from "react";
import { Shell } from "@/features/shell/Shell";
import { ClientGuard } from "@/features/auth/guards";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientGuard>
      <Shell>{children}</Shell>
    </ClientGuard>
  );
}
