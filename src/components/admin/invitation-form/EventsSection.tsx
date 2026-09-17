import React from "react";
import type { EventDetail } from "@/src/types/invitation";
import { formatDateID, isValidURL } from "./validation";

type EventsSectionProps = {
  events: {
    akad: EventDetail;
    reception: EventDetail;
  };
  updateState: (updater: (state: any) => any) => void;
};

export default function EventsSection({
  events,
  updateState,
}: EventsSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Acara</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Akad */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Akad</h4>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <div className="relative">
                {/* Hidden date input for picking */}
                <input
                  type="date"
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  value={events.akad.date || ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, date: selectedDate } } }));
                  }}
                  required
                />
                {/* Display formatted date */}
                <div className="w-full px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                  {events.akad.date ? formatDateID(events.akad.date) : 'Pilih tanggal'}
                </div>
                {(!events.akad.date || !/^\d{4}-\d{2}-\d{2}$/.test(events.akad.date)) && (
                  <p className="text-xs text-red-500 mt-1">Format tanggal tidak valid</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Hari</label>
              <input
                type="text"
                value={events.akad.dayName}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, dayName: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waktu</label>
              <input
                type="text"
                value={events.akad.time}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, time: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                placeholder="10.00 - 12.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                value={events.akad.venue}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, venue: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={events.akad.address}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, address: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Maps URL</label>
              <input
                type="text"
                value={events.akad.mapsUrl}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, akad: { ...s.events.akad, mapsUrl: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://maps.google.com/?..."
              />
              {!events.akad.mapsUrl || isValidURL(events.akad.mapsUrl) ? null : <p className="text-xs text-red-500 mt-1">URL Maps tidak valid</p>}
            </div>
          </div>
        </div>

        {/* Reception */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Resepsi</h4>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <div className="relative">
                {/* Hidden date input for picking */}
                <input
                  type="date"
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  value={events.reception.date || ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, date: selectedDate } } }));
                  }}
                  required
                />
                {/* Display formatted date */}
                <div className="w-full px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                  {events.reception.date ? formatDateID(events.reception.date) : 'Pilih tanggal'}
                </div>
                {(!events.reception.date || !/^\d{4}-\d{2}-\d{2}$/.test(events.reception.date)) && (
                  <p className="text-xs text-red-500 mt-1">Format tanggal tidak valid</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Hari</label>
              <input
                type="text"
                value={events.reception.dayName}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, dayName: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waktu</label>
              <input
                type="text"
                value={events.reception.time}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, time: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                placeholder="18.00 - 22.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                value={events.reception.venue}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, venue: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={events.reception.address}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, address: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Maps URL</label>
              <input
                type="text"
                value={events.reception.mapsUrl}
                onChange={(e) => updateState(s => ({ ...s, events: { ...s.events, reception: { ...s.events.reception, mapsUrl: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://maps.google.com/?..."
              />
              {!events.reception.mapsUrl || isValidURL(events.reception.mapsUrl) ? null : <p className="text-xs text-red-500 mt-1">URL Maps tidak valid</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}