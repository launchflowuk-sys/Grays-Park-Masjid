import { createContext, useContext, type ReactNode } from "react";
import { useGetCurrentAdmin, getGetCurrentAdminQueryKey, type AdminUser } from "@workspace/api-client-react";

interface AuthContextValue {
  admin: AdminUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: admin, isLoading, isError } = useGetCurrentAdmin({
    query: { retry: false, queryKey: getGetCurrentAdminQueryKey() },
  });

  const value: AuthContextValue = {
    admin,
    isLoading,
    isAuthenticated: !isError && !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
