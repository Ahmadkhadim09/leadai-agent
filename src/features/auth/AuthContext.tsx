"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { AUTHORIZED_ADMIN_EMAILS } from "@/config/auth";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "sdr" | "guest";
}

interface AuthContextType {
  user: UserProfile | null;
  role: "admin" | "sdr" | "guest";
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  isFirebaseActive: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsDemoAdmin: () => void;
  loginAsDemoSDR: () => void;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: UserProfile = {
  uid: "mock-admin-001",
  email: "alex.chen@leadpilot.demo",
  displayName: "Alex Chen (Senior Solutions Lead)",
  role: "admin",
};

const DEMO_SDR: UserProfile = {
  uid: "mock-sdr-002",
  email: "sdr@leadpilot.demo",
  displayName: "Jordan Taylor (Inbound SDR)",
  role: "sdr",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFirebaseActive = useMemo(() => isFirebaseConfigured(), []);

  useEffect(() => {
    const { auth, isConfigured } = getFirebaseClient();

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email) {
          const email = fbUser.email.toLowerCase();
          const isAdmin = AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email);

          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || (isAdmin ? "Admin User" : "SDR User"),
            role: isAdmin ? "admin" : "sdr",
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Development mock mode: check localStorage for saved demo session asynchronously
      try {
        const saved = typeof window !== "undefined" ? localStorage.getItem("leadpilot_mock_user") : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            setUser(parsed);
            setLoading(false);
          }, 0);
          return;
        }
      } catch {
        // Ignore localStorage error
      }
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    const { auth, isConfigured } = getFirebaseClient();

    if (isConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to authenticate with Firebase Auth.";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Local Mock Login: Check credentials
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password.");
        setLoading(false);
        throw new Error("Missing credentials");
      }

      const emailLower = email.toLowerCase().trim();
      const isAdmin =
        AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === emailLower) ||
        emailLower.includes("admin");

      const profile: UserProfile = {
        uid: `mock-${Date.now()}`,
        email,
        displayName: isAdmin ? "Demo Administrator" : "Demo SDR Representative",
        role: isAdmin ? "admin" : "sdr",
      };

      setUser(profile);
      try {
        localStorage.setItem("leadpilot_mock_user", JSON.stringify(profile));
      } catch {
        // Ignore
      }
      setLoading(false);
    }
  };

  const loginAsDemoAdmin = () => {
    const { isConfigured } = getFirebaseClient();
    if (isConfigured) {
      setError("Demo role quick-switching is strictly disabled when Live Firebase is configured. Please sign in with an authorized Firebase administrator account.");
      return;
    }
    setError(null);
    setUser(DEMO_ADMIN);
    try {
      localStorage.setItem("leadpilot_mock_user", JSON.stringify(DEMO_ADMIN));
    } catch {
      // Ignore
    }
  };

  const loginAsDemoSDR = () => {
    const { isConfigured } = getFirebaseClient();
    if (isConfigured) {
      setError("Demo role quick-switching is strictly disabled when Live Firebase is configured. Please sign in with your Firebase account.");
      return;
    }
    setError(null);
    setUser(DEMO_SDR);
    try {
      localStorage.setItem("leadpilot_mock_user", JSON.stringify(DEMO_SDR));
    } catch {
      // Ignore
    }
  };

  const logout = async () => {
    setError(null);
    const { auth, isConfigured } = getFirebaseClient();

    if (isConfigured && auth) {
      await fbSignOut(auth);
    }

    setUser(null);
    try {
      localStorage.removeItem("leadpilot_mock_user");
    } catch {
      // Ignore
    }
  };

  const getIdToken = async (): Promise<string> => {
    const { auth, isConfigured } = getFirebaseClient();

    if (isConfigured) {
      if (auth?.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return "";
    }

    // Mock tokens are strictly confined to unconfigured development mode
    if (user?.role === "admin") {
      return "mock-admin-token";
    }
    if (user?.role === "sdr") {
      return "mock-sdr-token";
    }
    return "";
  };

  const role = user?.role || "guest";
  const isAdmin = role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isAuthenticated,
        loading,
        isFirebaseActive,
        error,
        loginWithEmail,
        loginAsDemoAdmin,
        loginAsDemoSDR,
        logout,
        getIdToken,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
