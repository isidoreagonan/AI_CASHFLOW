import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Configure the API client to always send the JWT token from localStorage
setAuthTokenGetter(() => localStorage.getItem("token"));

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, returnTo?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const { data: me, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      // Retry once on network error before giving up — prevents logout on transient failures
      retry: 1,
      retryDelay: 1000,
      // Keep previous data while revalidating so the user doesn't flash to a loading state
      staleTime: 5 * 60 * 1000, // 5 minutes — don't re-fetch /api/auth/me too often
    }
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    } else if (error) {
      // Only force logout if the server explicitly says the token is invalid (401).
      // Network errors, 5xx server errors, or timeouts must NOT disconnect the user —
      // those are transient and the user's session should survive a server hiccup.
      const status = (error as any)?.status;
      if (status === 401) {
        logout();
      }
      // For any other error (network timeout, 500, etc.) we silently ignore it
      // — the user keeps their session and we retry on next page interaction.
    }
  }, [me, error]);

  const login = (newToken: string, newUser: User, returnTo?: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    // Redirect to returnTo if provided, otherwise use role-based default
    const destination = returnTo || (newUser.role === "admin" ? "/admin" : "/dashboard");
    setLocation(destination);
  };

  const logout = useCallback(() => {
    // Save current URL so the user can return there after re-login
    const currentPath = window.location.pathname + window.location.search;
    const shouldSave = currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/";
    const returnParam = shouldSave ? `?returnTo=${encodeURIComponent(currentPath)}` : "";

    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    queryClient.clear();
    setLocation(`/login${returnParam}`);
  }, [queryClient, setLocation]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading: !!token && isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_FALLBACK: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? AUTH_FALLBACK;
}
