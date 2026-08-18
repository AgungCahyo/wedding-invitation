"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Send, Sparkles, Trash2, Link as LinkIcon } from "lucide-react";
import { invitation } from "@/src/data/invitation";

interface GeneratedLink {
  id: string;
  name: string;
  url: string;
  waLink: string;
}

export default function AdminLinkGenerator() {
  const [rawInput, setRawInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Set base URL dynamically from window origin or fallback to invitation.meta.url
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    } else {
      setBaseUrl(invitation.meta.url);
    }
  }, []);

  const groomName = invitation.couple.groom.name.split(" ")[0];
  const brideName = invitation.couple.bride.name.split(" ")[0];

  const buildWaMessage = (guestName: string, guestUrl: string) => {
    const lines = [
      `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i *${guestName}* untuk berkenan hadir dan memberikan doa restu pada pernikahan kami.`,
      ``,
      `📌 *Berikut link undangan Anda:*`,
      guestUrl,
      ``,
      `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.`,
      ``,
      `Wassalamu'alaikum Wr. Wb.`,
      `*${groomName} & ${brideName}*`,
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  const handleGenerate = () => {
    const names = rawInput
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    const generated: GeneratedLink[] = names.map((name, index) => {
      const encodedName = encodeURIComponent(name);
      const url = `${baseUrl || invitation.meta.url}/${encodedName}`;
      const waText = buildWaMessage(name, url);
      const waLink = `https://api.whatsapp.com/send?text=${waText}`;

      return {
        id: `${index}-${name}`,
        name,
        url,
        waLink,
      };
    });

    setLinks(generated);
  };

  const handleCopySingle = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    if (links.length === 0) return;
    const text = links.map((l) => `${l.name}: ${l.url}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleClear = () => {
    setRawInput("");
    setLinks([]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="eyebrow tracking-widest text-xs uppercase text-[var(--accent)]">
            Admin Panel
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Generator Link Undangan Tamu
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Buat link undangan personal dan bagikan secara otomatis via WhatsApp atau copy ke daftar tamu.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="guest-names" className="eyebrow block mb-3 text-[var(--text-secondary)]">
              Daftar Nama Tamu (Satu Nama per Baris)
            </label>
            <textarea
              id="guest-names"
              rows={6}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={"Contoh:\nBudi Santoso\nSiti Nurhaliza & Partner\nKeluarga Pak Ahmad"}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-body placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!rawInput.trim()}
              className="btn-editorial-filled flex-1 inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              <Sparkles size={16} />
              Generate Link ({rawInput.split("\n").filter((n) => n.trim()).length})
            </button>

            {links.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-3 text-[var(--text-tertiary)] hover:text-red-600 border border-[var(--border)] hover:border-red-600/30 transition-colors"
                title="Bersihkan"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Generated Links List */}
        {links.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <h2 className="font-display text-xl text-[var(--text-primary)]">
                Hasil Link ({links.length} Tamu)
              </h2>
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-body text-[var(--accent)] hover:underline"
              >
                {copiedAll ? (
                  <>
                    <Check size={14} /> Tersalin Semua!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Semua (Format List)
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {links.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--bg-elevated,#ffffff)] border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--accent-muted)]"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-display font-medium text-lg text-[var(--text-primary)] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1.5 font-mono">
                      <LinkIcon size={12} className="shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(item.id, item.url)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-none"
                    >
                      <Send size={14} />
                      <span>Kirim WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
