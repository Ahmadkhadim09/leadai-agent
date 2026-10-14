"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  X,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  Database,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    loginWithEmail,
    loginAsDemoAdmin,
    loginAsDemoSDR,
    isFirebaseActive,
    error,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      await loginWithEmail(email, password);
      onClose();
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    onClose();
  };

  const handleDemoSDR = () => {
    loginAsDemoSDR();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">LeadPilot Portal Sign-In</h2>
              <p className="text-[11px] text-slate-500">
                Authenticate to access admin overrides and internal notes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Indicator */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-medium">Auth Provider:</span>
          </div>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
              isFirebaseActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {isFirebaseActive ? "Firebase Cloud Auth Active" : "Local Role Auth Active"}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., alex.chen@leadpilot.demo"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 shadow-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Password</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 shadow-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/30 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In with Email</span>
            )}
          </button>
        </form>

        {/* Quick Access Roles */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span className="uppercase tracking-wider">Fast Role Switch (Reviewers)</span>
            {isFirebaseActive && (
              <span className="text-amber-600 font-normal">Live Auth Active</span>
            )}
          </div>

          {isFirebaseActive ? (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Live Firebase Auth is active. Role quick-switching is locked out. Sign in using your verified Firebase credentials above.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all shadow-xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign in as Admin</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Alex Chen (Full Overrides)</p>
              </button>

              <button
                type="button"
                onClick={handleDemoSDR}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all shadow-xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sign in as SDR</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Jordan Taylor (Read/Notes)</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
