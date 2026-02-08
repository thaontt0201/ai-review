import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

export interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  pictureUrl: string | null;
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

  const currentUserQuery = trpc.currentUser.useQuery(undefined, {
    retry: false,
    enabled: true,
  });

  useEffect(() => {
    if (!currentUserQuery.isLoading) {
      setIsLoading(false);
      if (currentUserQuery.data) {
        setUser(currentUserQuery.data);
      } else {
        setUser(null);
      }
    }
  }, [currentUserQuery.isLoading, currentUserQuery.data]);

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
