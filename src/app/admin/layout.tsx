import React from "react";
import { Shell } from "@/features/shell/Shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>{children}</Shell>
  );
}
