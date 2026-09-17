import React from "react";

type QuoteSectionProps = {
  quote: {
    quranic: string;
    quranicTranslation: string;
    quranicReference: string;
  };
  updateState: (updater: (state: any) => any) => void;
};

export default function QuoteSection({
  quote,
  updateState,
}: QuoteSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Quote Al-Quran</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Arab</label>
          <textarea
            value={quote.quranic}
            onChange={(e) => updateState(s => ({ ...s, quote: { ...s.quote, quranic: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Terjemahan</label>
          <textarea
            value={quote.quranicTranslation}
            onChange={(e) => updateState(s => ({ ...s, quote: { ...s.quote, quranicTranslation: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Referensi (Surat: Ayat)</label>
          <input
            type="text"
            value={quote.quranicReference}
            onChange={(e) => updateState(s => ({ ...s, quote: { ...s.quote, quranicReference: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="QS. Al-Baqarah: 255"
          />
        </div>
      </div>
    </section>
  );
}
