"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  Trash2,
  AlertCircle,
  EyeOff,
  Eye,
  RefreshCw,
  Pin,
  PinOff,
} from "lucide-react";
import {
  fetchAllWishesForModeration,
  updateWishStatus,
  deleteWish,
  togglePinWish,
  WISH_APPROVAL_REQUIRED,
  type WishRecord,
} from "@/src/lib/wishes-service";
import type { WishStatus } from "@/src/types/wish";
import { formatDate } from "../shared/formatDate";
import { WishStatusBadge } from "./WishStatusBadge";

export function WishesManagement() {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // With approval off, wishes go straight to "approved" — "pending" would always look empty.
  const [filter, setFilter] = useState<WishStatus | "all">(WISH_APPROVAL_REQUIRED ? "pending" : "all");
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const loadWishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setWishes(await fetchAllWishesForModeration());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat ucapan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadWishes();
    });
  }, [loadWishes]);

  const handleSetStatus = async (id: number, status: WishStatus) => {
    setPendingActionId(id);
    setError(null);
    try {
      await updateWishStatus(id, status);
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status ucapan.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus ucapan ini secara permanen?")) return;
    setPendingActionId(id);
    setError(null);
    try {
      await deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus ucapan.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleTogglePin = async (id: number, currentlyPinned: boolean) => {
    setPendingActionId(id);
    setError(null);
    try {
      await togglePinWish(id, !currentlyPinned);
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_pinned: !currentlyPinned } : w))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status pin.");
    } finally {
      setPendingActionId(null);
    }
  };

  const filteredWishes = filter === "all" ? wishes : wishes.filter((w) => w.status === filter);
  const pendingCount = wishes.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { id: "pending", label: `Menunggu${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
              { id: "approved", label: "Tayang" },
              { id: "hidden", label: "Disembunyikan" },
              { id: "all", label: "Semua" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-body border transition-colors ${
                filter === f.id
                  ? "border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={loadWishes}
          className="inline-flex items-center gap-1.5 text-xs font-body text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw size={13} />
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 text-sm font-body">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] font-body py-12">Memuat ucapan...</p>
      ) : filteredWishes.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] font-body py-12">
          Tidak ada ucapan di kategori ini.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredWishes.map((wish) => (
            <li
              key={wish.id}
              className="border border-[var(--border)] p-4 sm:p-5 space-y-3 bg-[var(--bg-elevated,#ffffff)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-[var(--text-primary)] flex items-center gap-1.5">
                    {wish.is_pinned && (
                      <Pin size={12} className="text-[var(--accent)] shrink-0" fill="currentColor" />
                    )}
                    {wish.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-body mt-0.5">
                    {formatDate(wish.created_at)}
                  </p>
                </div>
                <WishStatusBadge status={wish.status} />
              </div>

              <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                {wish.message}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {wish.status !== "approved" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleSetStatus(wish.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Eye size={13} />
                    Tayangkan
                  </button>
                )}
                {wish.status === "approved" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleTogglePin(wish.id, wish.is_pinned)}
                    title={
                      wish.is_pinned
                        ? "Lepas dari sorotan"
                        : "Sematkan ke bagian atas (mis. ucapan dari orang tua)"
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border transition-colors disabled:opacity-50 ${
                      wish.is_pinned
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {wish.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    {wish.is_pinned ? "Lepas Sematan" : "Sematkan"}
                  </button>
                )}
                {wish.status !== "hidden" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleSetStatus(wish.id, "hidden")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  >
                    <EyeOff size={13} />
                    Sembunyikan
                  </button>
                )}
                <button
                  type="button"
                  disabled={pendingActionId === wish.id}
                  onClick={() => handleDelete(wish.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
