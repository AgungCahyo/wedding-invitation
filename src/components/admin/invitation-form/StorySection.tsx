import React from "react";
import type { StoryEntry } from "@/src/types/invitation";
import { NEUTRAL_IMAGE } from "@/src/lib/default-invitation";
import { formatDateID } from "./validation";

type StorySectionProps = {
  story: StoryEntry[];
  updateState: (updater: (state: any) => any) => void;
};

const defaultStory: StoryEntry = {
  title: "",
  date: "",
  description: "",
};

export default function StorySection({
  story,
  updateState,
}: StorySectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Cerita Kami</h3>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => updateState(s => ({ ...s, story: [...s.story, defaultStory] }))}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Tambah Cerita
        </button>
      </div>
      {story.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">Cerita #{index + 1}</h4>
            <button
              type="button"
              onClick={() => updateState(s => {
                const newStory = [...s.story];
                newStory.splice(index, 1);
                return { ...s, story: newStory };
              })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Hapus
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const newStory = [...story];
                  newStory[index] = { ...newStory[index], title: e.target.value };
                  updateState(s => ({ ...s, story: newStory }));
                }}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <div className="relative">
                {/* Hidden date input for picking */}
                <input
                  type="date"
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  value={item.date || ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const newStory = [...story];
                    newStory[index] = { ...newStory[index], date: selectedDate };
                    updateState(s => ({ ...s, story: newStory }));
                  }}
                  required
                />
                {/* Display formatted date */}
                <div className="w-full px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                  {item.date ? formatDateID(item.date) : 'Pilih tanggal'}
                </div>
                {(!item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) && (
                  <p className="text-xs text-red-500 mt-1">Format tanggal tidak valid</p>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                value={item.description}
                onChange={(e) => {
                  const newStory = [...story];
                  newStory[index] = { ...newStory[index], description: e.target.value };
                  updateState(s => ({ ...s, story: newStory }));
                }}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
      {story.length === 0 && <p className="text-sm text-gray-500">Belum ada cerita. Tambahkan cerita pertama di atas.</p>}
    </section>
  );
}