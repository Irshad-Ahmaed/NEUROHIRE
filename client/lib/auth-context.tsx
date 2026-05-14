"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  type AuthUser,
  type LoginResponse,
  type SignupResponse,
} from "@/api/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (formData: FormData) => Promise<LoginResponse>;
  signup: (formData: FormData) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(user?: AuthUser | null): AuthUser | null {
  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await authApi.me();
      const nextUser = data.authenticated ? normalizeUser(data.user) : null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    authApi
      .me()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const nextUser = data.authenticated ? normalizeUser(data.user) : null;
        setUser(nextUser);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUser(null);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (formData: FormData) => {
    const response = await authApi.login(formData);
    const nextUser = normalizeUser(response.user);

    setUser(nextUser);
    setIsLoading(false);

    return response;
  }, []);

  const signup = useCallback(async (formData: FormData) => {
    const response = await authApi.signup(formData);
    setIsLoading(false);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
