"use client";

import { useEffect, useState, startTransition, type FormEvent, type ReactNode } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { ADMIN_PIN_KEY, ADMIN_SESSION_KEY, ADMIN_EXPIRED_EVENT } from "@/src/lib/admin-session";

export function AdminAuth({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // The PIN is kept for the session too: the server re-checks it on every
    // moderation request. A session from before this change has no PIN → re-login.
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    const hasPin = Boolean(sessionStorage.getItem(ADMIN_PIN_KEY));
    startTransition(() => {
      if (stored === "true" && hasPin) {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    });

    // adminFetch() fires this when the server rejects the stored PIN.
    const onExpired = () => {
      setIsAuthenticated(false);
      setError("Sesi habis. Silakan masuk lagi.");
    };
    window.addEventListener(ADMIN_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(ADMIN_EXPIRED_EVENT, onExpired);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      // The PIN is checked on the server, so it never ships in the client bundle
      // and the login always agrees with what the admin API routes accept.
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        cache: "no-store",
        headers: { "x-admin-pin": pin },
      });
      if (res.ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        sessionStorage.setItem(ADMIN_PIN_KEY, pin);
        setIsAuthenticated(true);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(res.status === 401 ? "PIN salah. Silakan coba lagi." : json.error ?? "Gagal masuk.");
      setPin("");
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
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
              disabled={!pin || isSubmitting}
              className="btn-editorial-filled disabled:opacity-50"
            >
              {isSubmitting ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
