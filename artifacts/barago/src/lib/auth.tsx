import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetCurrentUser, useLogoutUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useGetCurrentUser({
    query: {
      retry: false,
    }
  });

  const logoutMutation = useLogoutUser();
  const [, setLocation] = useLocation();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    refetch();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
