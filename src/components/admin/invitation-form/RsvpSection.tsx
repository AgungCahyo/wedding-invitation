import React from "react";
import type { Invitation } from "@/src/types/invitation";
import { formatDateID, isValidURL } from "./validation";

type RsvpSectionProps = {
  rsvp: Invitation['rsvp'];
  updateState: (updater: (state: any) => any) => void;
};

export default function RsvpSection({
  rsvp,
  updateState,
}: RsvpSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">RSVP</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Batas Waktu RSVP</label>
          <div className="relative">
            {/* Hidden date input for picking */}
            <input
              type="date"
              className="absolute inset-0 opacity-0 pointer-events-none"
              value={rsvp.deadline || ''}
              onChange={(e) => {
                const selectedDate = e.target.value;
                updateState(s => ({ ...s, rsvp: { ...s.rsvp, deadline: selectedDate } }));
              }}
              required
            />
            {/* Display formatted date */}
            <div className="w-full px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
              {rsvp.deadline ? formatDateID(rsvp.deadline) : 'Pilih tanggal'}
            </div>
            {(!rsvp.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(rsvp.deadline)) && (
              <p className="text-xs text-red-500 mt-1">Format tanggal tidak valid</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Catatan Batas Waktu</label>
          <input
            type="text"
            value={rsvp.deadlineNote}
            onChange={(e) => updateState(s => ({ ...s, rsvp: { ...s.rsvp, deadlineNote: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Contoh: Konfirmasi ke hadir sebelum tanggal ini"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
          <input
            type="text"
            value={rsvp.waNumber}
            onChange={(e) => updateState(s => ({ ...s, rsvp: { ...s.rsvp, waNumber: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="6281234567890"
          />
        </div>
      </div>
    </section>
  );
}