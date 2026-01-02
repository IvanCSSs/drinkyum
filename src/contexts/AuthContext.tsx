"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getCustomer,
  loginCustomer as apiLogin,
  logoutCustomer as apiLogout,
  registerCustomer as apiRegister,
  isAuthenticated as checkAuth,
  type Customer,
  type RegisterData,
} from "@/lib/auth";

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customer on mount if authenticated
  const refreshCustomer = useCallback(async () => {
    if (!checkAuth()) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { customer: loadedCustomer } = await getCustomer();
      setCustomer(loadedCustomer);
    } catch (err) {
      console.error("Failed to load customer:", err);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiLogin(email, password);
      if (response.customer) {
        setCustomer(response.customer);
      } else {
        await refreshCustomer();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCustomer]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiRegister(data);
      if (response.customer) {
        setCustomer(response.customer);
      } else {
        await refreshCustomer();
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCustomer]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await apiLogout();
      setCustomer(null);
    } catch (err) {
      console.error("Logout failed:", err);
      // Still clear customer on logout failure
      setCustomer(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshCustomer,
        clearError,
      }}
    >
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
