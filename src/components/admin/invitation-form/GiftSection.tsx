import React from "react";
import type { Invitation } from "@/src/types/invitation";

type GiftSectionProps = {
  gift: Invitation['gift'];
  updateState: (updater: (state: any) => any) => void;
};

const defaultGiftMethod: Invitation['gift']['methods'][number] = {
  id: "",
  owner: "groom",
  type: "bank",
  label: "",
  accountNumber: "",
  accountHolder: "",
};

export default function GiftSection({
  gift,
  updateState,
}: GiftSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Hadiah</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Catatan Hadiah</label>
        <textarea
          value={gift.note}
          onChange={(e) => updateState(s => ({ ...s, gift: { ...s.gift, note: e.target.value } }))}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          placeholder="Contoh: Hadiah tidak wajib, hadiah hadir sudah cukup"
        />
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => updateState(s => ({ ...s, gift: { ...s.gift, methods: [...s.gift.methods, defaultGiftMethod] } }))}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Tambah Metode Hadiah
        </button>
      </div>

      {gift.methods.map((method, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">Metode Hadiah #{index + 1}</h4>
            <button
              type="button"
              onClick={() => updateState(s => {
                const newMethods = [...s.gift.methods];
                newMethods.splice(index, 1);
                return { ...s, gift: { ...s.gift, methods: newMethods } };
              })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Hapus
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Pemilik</label>
              <select
                value={method.owner}
                onChange={(e) => {
                  const newMethods = [...gift.methods];
                  newMethods[index] = { ...newMethods[index], owner: e.target.value as "groom" | "bride" };
                  updateState(s => ({ ...s, gift: { ...s.gift, methods: newMethods } }));
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="groom">Pria</option>
                <option value="bride">Wanita</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jenis</label>
              <select
                value={method.type}
                onChange={(e) => {
                  const newMethods = [...gift.methods];
                  newMethods[index] = { ...newMethods[index], type: e.target.value as "bank" | "ewallet" };
                  updateState(s => ({ ...s, gift: { ...s.gift, methods: newMethods } }));
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={method.label}
                onChange={(e) => {
                  const newMethods = [...gift.methods];
                  newMethods[index] = { ...newMethods[index], label: e.target.value };
                  updateState(s => ({ ...s, gift: { ...s.gift, methods: newMethods } }));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="Contoh: BCA, GoPay, dll"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Rekening / ID</label>
              <input
                type="text"
                value={method.accountNumber}
                onChange={(e) => {
                  const newMethods = [...gift.methods];
                  newMethods[index] = { ...newMethods[index], accountNumber: e.target.value };
                  updateState(s => ({ ...s, gift: { ...s.gift, methods: newMethods } }));
                }}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={method.accountHolder}
                onChange={(e) => {
                  const newMethods = [...gift.methods];
                  newMethods[index] = { ...newMethods[index], accountHolder: e.target.value };
                  updateState(s => ({ ...s, gift: { ...s.gift, methods: newMethods } }));
                }}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>
      ))}
      {gift.methods.length === 0 && <p className="text-sm text-gray-500">Belum ada metode hadiah. Tambahkan metode pertama di atas.</p>}
    </section>
  );
}