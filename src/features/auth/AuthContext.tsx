"use client";

import React, { createContext, useContext } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
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
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const role: UserRole | null = user?.role || null;
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isLoading = status === "loading";

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isClient, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
