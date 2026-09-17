import React from "react";
import { formatDateID } from "./validation";

type WeddingSectionProps = {
  wedding: {
    date: string;
    displayDate: string;
    timezone: string;
  };
  updateState: (updater: (state: any) => any) => void;
};

export default function WeddingSection({
  wedding,
  updateState,
}: WeddingSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Informasi Pernikahan</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal (YYYY-MM-DD)</label>
          <input
            type="date"
            value={wedding.date}
            onChange={(e) => updateState(s => ({ ...s, wedding: { ...s.wedding, date: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {!wedding.date || /^\d{4}-\d{2}-\d{2}$/.test(wedding.date) ? null : <p className="text-xs text-red-500 mt-1">Format tanggal tidak valid</p>}
          {wedding.date ? <p className="text-xs text-gray-500 mt-1">Format tanggal: {formatDateID(wedding.date)}</p> : null}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Tampilan</label>
          <input
            type="text"
            value={wedding.displayDate}
            onChange={(e) => updateState(s => ({ ...s, wedding: { ...s.wedding, displayDate: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Sabtu, 1 Januari 2023"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <input
            type="text"
            value={wedding.timezone}
            onChange={(e) => updateState(s => ({ ...s, wedding: { ...s.wedding, timezone: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Asia/Jakarta"
          />
        </div>
      </div>
    </section>
  );
}