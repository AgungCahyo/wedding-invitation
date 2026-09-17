"use client";

import { useEffect, useState, startTransition, type ReactNode } from "react";
import { Lock, AlertCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { getCurrentUserMembership } from "@/src/lib/admin-membership-service";
import { Session } from "@supabase/supabase-js";

export function AdminAuth({
  children,
  invitationId
}: {
  children: ReactNode;
  invitationId?: string | null
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // null = not yet checked, true/false = resolved. Authentication (do we
  // have a session) and authorization (does that user have an
  // invitation_members row) are deliberately separate checks — a valid
  // session used to be treated as sufficient on its own, which let any
  // Supabase Auth user reach the admin shell before failing later at the
  // database layer on their first write.
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      startTransition(() => {
        setIsChecking(false);
      });
      return () => {
        cancelled = true;
      };
    }

    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (cancelled) return;

      const hasSession = Boolean(data.session);

      if (!hasSession) {
        startTransition(() => {
          setIsAuthenticated(false);
          setIsAuthorized(null);
          setIsChecking(false);
        });
        return;
      }

      // We have a session, now check authorization for the invitation
      setIsAuthenticated(true);
      // We'll keep isChecking true until we get the auth result

      if (!invitationId) {
        // If no invitationId, we cannot check via API. Fall back to membership check?
        // But we want to allow super admins too. Since we cannot check super admin on client,
        // we will have to make an API call to check super admin status? 
        // Instead, we can use the existing getCurrentUserMembership without invitationId 
        // to see if there is any membership, and if not, we cannot know if they are super admin.
        // For now, we will treat as not authorized if no invitationId and no membership.
        // This is a limitation, but the admin UI is expected to have an invitationId.
        const membership = await getCurrentUserMembership(invitationId ?? undefined);
        if (cancelled) return;
        startTransition(() => {
          setIsAuthorized(Boolean(membership));
          setIsChecking(false);
        });
        return;
      }

      // Use AbortController to allow cancellation
      const abortController = new AbortController();
      try {
        const response = await fetch(`/api/admin/invitations/${invitationId}`, {
          signal: abortController.signal,
          // We don't need credentials? The request will include cookies automatically (same-origin)
        });
        if (cancelled) return;
        if (response.ok) {
          // 200-299
          startTransition(() => {
            setIsAuthorized(true);
            setIsChecking(false);
          });
        } else {
          // Treat any other status as not authorized (including 401, 403, 404, etc.)
          startTransition(() => {
            setIsAuthorized(false);
            setIsChecking(false);
          });
        }
      } catch (err) {
        if (cancelled) return;
        // Network error or abort
        console.error("Failed to check admin authorization:", err);
        startTransition(() => {
          setIsAuthorized(false);
          setIsChecking(false);
        });
      } finally {
        // Clean up the abort controller
        abortController.abort();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!authError) {
      const membership = await getCurrentUserMembership(invitationId ?? undefined);
      setIsAuthenticated(true);
      setIsAuthorized(Boolean(membership));
    } else {
      setError("Email atau password tidak valid.");
      setPassword("");
    }
  };

  // Avoid a flash of the lock screen while sessionStorage is being read.
  if (isChecking) {
    return <div className="min-h-screen bg-[var(--bg-primary)]" />;
  }

  if (isAuthenticated && isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-[var(--border)] mb-5">
            <ShieldAlert size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
          </div>
          <p className="font-medium tracking-widest text-xs uppercase text-[var(--accent)] mb-3">
            Akses Ditolak
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)] mb-3">
            Anda belum terdaftar sebagai pengelola undangan
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Akun Anda berhasil login, tetapi belum memiliki akses ke undangan ini. Hubungi
            pemilik undangan untuk ditambahkan sebagai admin.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 border border-[var(--border)] mb-5">
              <Lock size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
            </div>
            <p className="font-medium tracking-widest text-xs uppercase text-[var(--accent)] mb-3">
              Admin Panel
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
              Masuk sebagai Admin
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Email admin"
                className="input-editorial"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Password"
                className="input-editorial mt-3"
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
              disabled={!email || !password}
              className="block w-full py-4 px-6 font-body text-[0.6875rem] font-medium tracking-[0.25em] uppercase text-[var(--text-primary)] border border-[var(--text-primary)] transition-colors duration-300 [&:not(:disabled)]:hover:bg-[var(--text-primary)] [&:not(:disabled)]:hover:text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
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