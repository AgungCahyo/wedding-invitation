import React from "react";
import type { Invitation } from "@/src/types/invitation";

type ClosingSectionProps = {
  closing: Invitation['closing'];
  updateState: (updater: (state: any) => any) => void;
};

export default function ClosingSection({
  closing,
  updateState,
}: ClosingSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Penutup</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pesan Penutup</label>
          <textarea
            value={closing.message}
            onChange={(e) => updateState(s => ({ ...s, closing: { ...s.closing, message: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nama Pasangan untuk Penutup</label>
          <input
            type="text"
            value={closing.couple}
            onChange={(e) => updateState(s => ({ ...s, closing: { ...s.closing, couple: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Contoh: Dengan suami, [Nama Pria]"
          />
        </div>
      </div>
    </section>
  );
}