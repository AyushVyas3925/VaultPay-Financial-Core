"use client";

import React, { createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { UserRole } from "@/types/user";

interface AuthContextType {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: UserRole;
    clientId?: string;
  } | null;
  role: UserRole | null;
  isAdmin: boolean;
  isClient: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isClient: false,
  isLoading: true,
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const role: UserRole | null = user?.role || null;
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isLoading = status === "loading";

  const logout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vp_logged_out", "true");
    }
    await fetch("/api/auth/logout", { method: "POST" });
    try {
      await signOut({ redirect: false });
    } catch {
      // Ignored: Ensure redirect still runs if next-auth client fails
    }
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isClient, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
