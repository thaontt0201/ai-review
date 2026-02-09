/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserQuery = useQuery(
    trpc.currentUser.queryOptions(undefined, {
      retry: false,
      enabled: true,
      refetchOnWindowFocus: false,
    }),
  );

  useEffect(() => {
    if (currentUserQuery.isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      if (currentUserQuery.isSuccess && currentUserQuery.data) {
        setUser(currentUserQuery.data);
      } else {
        setUser(null);
      }
    }
  }, [
    currentUserQuery.isLoading,
    currentUserQuery.isSuccess,
    currentUserQuery.data,
  ]);

  const login = () => {
    window.location.href = "/auth/google";
  };

  const logout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      setUser(null);
      currentUserQuery.refetch();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
