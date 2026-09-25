"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi } from "@/services/api";

type User = { 
  _id: string; 
  name: string; 
  email?: string; 
  phone?: string;
  role: string;
  isPhoneVerified?: boolean;
  referralCode?: string;
  walletBalance?: number;
} | null;

interface AuthContextType {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerWithPhoneOtp: (data: {
    phone: string;
    otp: string;
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  updateUser: (name: string, email: string, phone?: string) => Promise<void>;
  logout: () => void;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(t);
    if (!t) setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setTokenState(null);
      setUser(null);
      setLoading(false);
      return;
    }
    setTokenState(t);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.token);
    setTokenState(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, phone: (data as any).phone, role: data.role });
  }, []);

  const loginWithPhone = useCallback(async (phone: string, password: string) => {
    const data = await authApi.phoneLogin({ phone, password });
    const userObj = data.user || data;
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.token);
    setTokenState(data.token);
    setUser({
      _id: userObj._id,
      name: userObj.name,
      phone: userObj.phone,
      email: userObj.email,
      role: userObj.role,
      isPhoneVerified: userObj.isPhoneVerified,
      referralCode: userObj.referralCode,
      walletBalance: userObj.walletBalance,
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register({ name, email, password });
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.token);
    setTokenState(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, phone: (data as any).phone, role: data.role });
  }, []);

  const registerWithPhoneOtp = useCallback(
    async (payload: {
      phone: string;
      otp: string;
      name: string;
      email: string;
      password: string;
      referralCode?: string;
    }) => {
      const data = await authApi.verifyRegistrationOTP(payload);
      const userObj = data.user || data;
      if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.token);
      setTokenState(data.token);
      setUser({
        _id: userObj._id,
        name: userObj.name,
        phone: userObj.phone,
        email: userObj.email,
        role: userObj.role,
        isPhoneVerified: userObj.isPhoneVerified,
        referralCode: userObj.referralCode,
        walletBalance: userObj.walletBalance,
      });
    },
    []
  );

  const updateUser = useCallback(async (name: string, email: string, phone?: string) => {
    const updated = await authApi.updateMe({ name, email, phone });
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithPhone,
        register,
        registerWithPhoneOtp,
        updateUser,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
