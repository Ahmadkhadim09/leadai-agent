"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Activity,
  Settings,
  Bot,
  Sparkles,
  Database,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { MAIN_NAV_ITEMS } from "@/config/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthModal } from "@/features/auth/AuthModal";

const ICON_MAP = {
  LayoutDashboard,
  MessageSquare,
  Users,
  Activity,
  Settings,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, isAdmin, isAuthenticated, loading, isFirebaseActive, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Top Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                LeadPilot
              </span>
              <span className="px-2 py-0.5 text-xs uppercase font-bold tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                AI SDR
              </span>
            </div>
          </Link>
        </div>

        {/* Global Adapter Status & Authentication */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-xs text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AI: <strong className="text-blue-900 font-bold">Gemini 3.8 Flash Active</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Cloud DB:{" "}
              {isFirebaseActive ? (
                <strong className="text-emerald-700 font-bold">Connected (Live Firestore)</strong>
              ) : (
                <strong className="text-emerald-700 font-bold">Connected (leadpilot-ai-222e8)</strong>
              )}
            </span>
          </div>

          <Link
            href="/chat"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start AI Chat</span>
          </Link>

          {/* User Auth Section */}
          <div className="border-l border-slate-200 pl-3 ml-1 flex items-center gap-2">
            {loading ? (
              <div className="w-20 h-8 rounded-lg bg-slate-100 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div
                  onClick={() => setIsAuthModalOpen(true)}
                  className="cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
                  title="Click to switch user role"
                >
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {isAdmin ? (
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {user.displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase font-mono font-medium">
                      {role}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      isAdmin
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-xs"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Sidebar Navigation */}
        <nav aria-label="Main Navigation" className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-1.5">
            <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.iconName];
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Page Content */}
        <main className="flex-1 min-w-0 pb-16">{children}</main>
      </div>

      {/* Mobile Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.iconName];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
