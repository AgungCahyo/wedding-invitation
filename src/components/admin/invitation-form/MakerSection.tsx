import React from "react";
import type { Invitation } from "@/src/types/invitation";
import { isValidURL } from "./validation";

type MakerSectionProps = {
  maker: Invitation['maker'];
  updateState: (updater: (state: any) => any) => void;
};

export default function MakerSection({
  maker,
  updateState,
}: MakerSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Made With</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Pembuat</label>
          <input
            type="text"
            value={maker.name}
            onChange={(e) => updateState(s => ({ ...s, maker: { ...s.maker, name: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL Pembuat</label>
          <input
            type="text"
            value={maker.url}
            onChange={(e) => updateState(s => ({ ...s, maker: { ...s.maker, url: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="https://example.com"
          />
          {!maker.url || isValidURL(maker.url) ? null : <p className="text-xs text-red-500 mt-1">URL tidak valid</p>}
        </div>
      </div>
    </section>
  );
}