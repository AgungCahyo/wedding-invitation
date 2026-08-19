"use client";

import { useEffect, useState, startTransition, type FormEvent, type ReactNode } from "react";
import { Lock, AlertCircle } from "lucide-react";

const SESSION_KEY = "admin_authenticated";
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456";

export function AdminAuth({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    startTransition(() => {
      if (stored === "true") {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("PIN salah. Silakan coba lagi.");
      setPin("");
    }
  };

  // Avoid a flash of the lock screen while sessionStorage is being read.
  if (isChecking) {
    return <div className="min-h-screen bg-[var(--bg-primary)]" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 border border-[var(--border)] mb-5">
              <Lock size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
            </div>
            <p className="eyebrow tracking-widest text-xs uppercase text-[var(--accent)] mb-3">
              Admin Panel
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
              Masukkan PIN Admin
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="••••••"
                className="input-editorial text-center text-lg tracking-[0.5em]"
              />
              {error && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 mt-3">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!pin}
              className="btn-editorial-filled disabled:opacity-50"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
