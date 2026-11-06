"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import {
  fetchRSVPResponses,
  getRSVPStats,
  type GuestResponse,
} from "@/src/lib/rsvp-service";
import { escapeCSVField } from "../shared/escapeCSV";
import { formatDate } from "../shared/formatDate";
import { RSVPStats } from "./RSVPStats";
import { RSVPTable } from "./RSVPTable";

export function RSVPManagement() {
  const [responses, setResponses] = useState<GuestResponse[]>([]);
  const [stats, setStats] = useState({ total: 0, attending: 0, notAttending: 0, totalGuests: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [responsesResult, statsResult] = await Promise.all([
        fetchRSVPResponses(),
        getRSVPStats(),
      ]);

      if (!responsesResult.success) {
        setError("Fitur RSVP belum aktif. Periksa konfigurasi Supabase.");
        return;
      }

      setResponses(responsesResult.data);
      setStats(statsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data RSVP.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadData();
    });
  }, [loadData]);

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = ["Nama", "Status", "Jumlah Tamu", "Ngunduh Mantu", "Pesan", "Tanggal"];
    const rows = responses.map((r) => [
      escapeCSVField(r.name),
      escapeCSVField(r.attendance === "attending" ? "Hadir" : "Tidak Hadir"),
      escapeCSVField(r.attendance === "attending" ? r.guest_count ?? 1 : 0),
      escapeCSVField(
        r.event_responses?.["ngunduh-mantu"] === "attending"
          ? "Hadir"
          : r.event_responses?.["ngunduh-mantu"] === "not-attending"
            ? "Berhalangan"
            : ""
      ),
      escapeCSVField(r.message ?? ""),
      escapeCSVField(formatDate(r.created_at)),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    // Prefix with a BOM so Excel opens UTF-8 (Indonesian names/diacritics) correctly.
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-${invitation.couple.groom.name.split(" ")[0].toLowerCase()}-${invitation.couple.bride.name.split(" ")[0].toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--text-tertiary)] gap-2 text-sm">
        <RefreshCw size={16} className="animate-spin" />
        Memuat data RSVP...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 text-center space-y-3">
        <AlertCircle size={24} className="mx-auto text-red-600" />
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <button type="button" onClick={loadData} className="btn-editorial mt-2">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RSVPStats stats={stats} />

      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <h2 className="font-display text-xl text-[var(--text-primary)]">
          Tanggapan Tamu ({responses.length})
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-body text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-body text-[var(--accent)] hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            <Download size={14} />
            Export ke CSV
          </button>
        </div>
      </div>

      <RSVPTable responses={responses} />
    </div>
  );
}
