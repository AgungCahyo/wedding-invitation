"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      if (!supabase) {
        setError("Supabase is not configured");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      console.log("LOGIN PAGE: useEffect - session exists:", !!session);
      if (session) {
        console.log("LOGIN PAGE: useEffect - redirecting to /admin");
        // If already logged in, redirect to admin
        router.push("/admin");
      }
    };

    checkAuth();
  }, []); // Fixed: Empty dependency array - run only on mount

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("LOGIN PAGE: handleSubmit - attempting sign in with email:", email.trim());

    if (!supabase) {
      setError("Supabase is not configured");
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("Invalid email or password");
        setPassword("");
        console.log("LOGIN PAGE: handleSubmit - sign in failed:", authError);
      } else {
        // Successfully signed in, redirect to admin
        console.log("LOGIN PAGE: handleSubmit - sign in successful");
        router.push("/admin");
      }
    } catch (err) {
      setError("An error occurred during sign in");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <LogIn size={24} className="mx-auto h-10 w-10 text-[var(--accent)]" />
          <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
            Admin Login
          </h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Sign in to access the admin dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-xs text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="input-editorial"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="input-editorial"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 mt-3">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`block w-full py-3 px-4 font-medium text-[var(--text-primary)] border border-[var(--text-primary)] transition-colors duration-300 [&:not(:disabled)]:hover:bg-[var(--text-primary)] [&:not(:disabled)]:hover:text-[var(--bg-primary)] disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Don't have access? Contact the system administrator.
        </p>
      </div>
    </div>
  );
}