"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  Trash2,
  AlertCircle,
  EyeOff,
  Eye,
  RefreshCw,
  Download,
  Zap,
  Loader2,
} from "lucide-react";
import {
  fetchAllPhotosForModeration,
  setPhotoStatus,
  deletePhoto,
  fetchPhotoSettings,
  setPhotoAutoApprove,
  photoUrl,
  photoFileName,
  type PhotoRecord,
  type PhotoStatus,
} from "@/src/lib/photobooth/photo-service";
import { formatDate } from "../shared/formatDate";

export function PhotoManagement() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PhotoStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [settingsReady, setSettingsReady] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPhotos(await fetchAllPhotosForModeration());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat foto.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      load();
    });
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    fetchPhotoSettings()
      .then((s) => {
        if (cancelled) return;
        setAutoApprove(s.autoApprove);
        setSettingsReady(s.ready);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Gagal memuat pengaturan.",
          );
      })
      .finally(() => {
        if (!cancelled) setSettingsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleAuto = async () => {
    if (savingAuto || !settingsLoaded) return;

    const next = !autoApprove;

    setSavingAuto(true);
    setError(null);

    try {
      await setPhotoAutoApprove(next);
      setAutoApprove(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan.",
      );
    } finally {
      setSavingAuto(false);
    }
  };

  const handleStatus = async (id: string, status: PhotoStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await setPhotoStatus(id, status);
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (photo: PhotoRecord) => {
    if (!window.confirm(`Hapus permanen foto dari ${photo.guest_name}?`))
      return;
    setBusyId(photo.id);
    setError(null);
    try {
      await deletePhoto(photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto.");
    } finally {
      setBusyId(null);
    }
  };

  const shown =
    filter === "all" ? photos : photos.filter((p) => p.status === filter);
  const pendingCount = photos.filter((p) => p.status === "pending").length;

  // Original-quality ZIP of whatever the current filter shows.
  const [zip, setZip] = useState<{ done: number; total: number } | null>(null);
  const handleDownloadAll = async () => {
    if (shown.length === 0 || zip) return;
    setError(null);
    setZip({ done: 0, total: shown.length });
    try {
      const { default: JSZip } = await import("jszip");
      const archive = new JSZip();
      const used = new Set<string>();
      for (const [i, photo] of shown.entries()) {
        const res = await fetch(photoUrl(photo.storage_path));
        if (!res.ok)
          throw new Error(`Gagal mengunduh foto dari ${photo.guest_name}.`);
        let name = photoFileName(photo);
        if (used.has(name)) name = name.replace(/\.jpg$/, `-${i + 1}.jpg`);
        used.add(name);
        archive.file(name, await res.blob()); // JPEGs are already compressed
        setZip({ done: i + 1, total: shown.length });
      }
      const blob = await archive.generateAsync({
        type: "blob",
        compression: "STORE",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Wedding-Photobooth-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat ZIP.");
    } finally {
      setZip(null);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`flex items-start sm:items-center justify-between gap-4 p-4 sm:p-5 border transition-colors ${
          autoApprove
            ? "border-emerald-600/40 bg-emerald-50"
            : "border-[var(--border)] bg-[var(--bg-secondary)]"
        }`}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-body text-[0.9375rem] font-medium text-[var(--text-primary)]">
            <Zap
              size={15}
              className={
                autoApprove ? "text-emerald-700" : "text-[var(--text-tertiary)]"
              }
            />
            Auto-approve foto
            <span
              className={`px-2 py-0.5 text-xs font-medium ${
                autoApprove
                  ? "bg-emerald-600 text-white"
                  : "bg-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              {autoApprove ? "Aktif" : "Nonaktif"}
            </span>
          </p>
          <p className="font-body text-[13px] leading-snug text-[var(--text-secondary)] mt-1">
            {autoApprove}{" "}
          </p>
          {!settingsReady && (
            <p className="font-body text-[13px] leading-snug text-amber-700 mt-1.5">
              Pengaturan belum bisa disimpan: jalankan{" "}
              <code>supabase/migrations/008_app_settings.sql</code> di Supabase
              SQL Editor.
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoApprove}
          aria-label="Auto-approve foto"
          onClick={handleToggleAuto}
          disabled={!settingsLoaded || savingAuto || !settingsReady}
          className={`relative shrink-0 inline-flex items-center w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
            autoApprove ? "bg-emerald-600" : "bg-[var(--accent-muted)]"
          }`}
        >
          <span
            className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center transition-transform ${
              autoApprove ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {savingAuto && (
              <Loader2
                size={12}
                className="animate-spin text-[var(--text-tertiary)]"
              />
            )}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { id: "all", label: `Semua (${photos.length})` },
              {
                id: "pending",
                label: `Menunggu${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
              },
              { id: "approved", label: "Tayang" },
              { id: "hidden", label: "Disembunyikan" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-body border transition-colors ${
                filter === f.id
                  ? "border-[var(--accent)] text-[var(--text-primary)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/photowall"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Eye size={13} /> Buka Layar Acara
          </a>
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={shown.length === 0 || !!zip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <Download size={13} />
            {zip
              ? `Menyiapkan ${zip.done}/${zip.total}…`
              : `Unduh semua (${shown.length})`}
          </button>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw size={13} /> Muat ulang
          </button>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
          Memuat…
        </p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
          Belum ada foto di kategori ini.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {shown.map((photo) => (
            <li
              key={photo.id}
              className="border border-[var(--border)] bg-[var(--bg-elevated,#ffffff)]"
            >
              <div className="relative aspect-[3/4] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(photo.storage_path)}
                  alt={`Foto oleh ${photo.guest_name}`}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover ${
                    photo.status === "hidden" ? "opacity-40" : ""
                  }`}
                />
                {photo.status === "hidden" && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-black/70 text-white">
                    Disembunyikan
                  </span>
                )}
                {photo.status === "pending" && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-amber-600 text-white">
                    Menunggu
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-display text-sm text-[var(--text-primary)] truncate">
                    {photo.guest_name}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {formatDate(photo.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {photo.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => handleStatus(photo.id, "approved")}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Eye size={12} />
                    </button>
                  )}
                  {photo.status !== "hidden" && (
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => handleStatus(photo.id, "hidden")}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                      <EyeOff size={12} />
                    </button>
                  )}
                  <a
                    href={photoUrl(photo.storage_path, photoFileName(photo))}
                    download
                    aria-label="Unduh foto"
                    title="Unduh foto"
                    className="ml-auto inline-flex items-center justify-center w-7 h-7 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                  >
                    <Download size={13} />
                  </a>
                  <button
                    type="button"
                    disabled={busyId === photo.id}
                    onClick={() => handleDelete(photo)}
                    aria-label="Hapus foto"
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
