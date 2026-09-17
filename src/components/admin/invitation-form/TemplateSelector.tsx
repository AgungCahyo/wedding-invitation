import React from "react";
import type { TemplateKey } from "@/src/types/invitation";

type TemplateSelectorProps = {
  template: TemplateKey;
  updateState: (updater: (state: any) => any) => void;
};

export default function TemplateSelector({ template, updateState }: TemplateSelectorProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Template</h3>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Template:</label>
        <select
          value={template}
          onChange={(e) =>
            updateState((s: any) => ({
              ...s,
              template: e.target.value as TemplateKey,
            }))
          }
          className="px-3 py-2 border rounded"
        >
          <option value="ayutika">Ayutika</option>
          <option value="balekambang">Balekambang</option>
          <option value="pesona">Pesona</option>
          {/* Add more templates as needed */}
        </select>
      </div>
    </section>
  );
}