import React from "react";
import type { Invitation } from "@/src/types/invitation";

type AudioSectionProps = {
  audio: Invitation['audio'];
  updateState: (updater: (state: any) => any) => void;
  getPublicUrl: (storagePath: string | null | undefined) => string;
  uploadStatus: Record<
    string,
    { status: 'idle' | 'loading' | 'success' | 'error'; error?: string; previewUrl?: string }
  >;
  handleAssetUpload: (
    fieldKey: string,
    file: File,
    assetType: string
  ) => Promise<void>;
};

export default function AudioSection({
  audio,
  updateState,
  getPublicUrl,
  uploadStatus,
  handleAssetUpload,
}: AudioSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Audio Latar</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL Audio</label>
          <div className="flex flex-col gap-2">
            {/* Upload button and input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                value={audio.src}
                onChange={(e) => updateState(s => ({ ...s, audio: { ...s.audio, src: e.target.value } }))}
                className="w-full sm:w-64 px-3 py-2 border rounded"
                placeholder="URL file audio (MP3, OGG, etc.)"
              />
              <button
                type="button"
                onClick={async () => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'audio/*';
                  fileInput.onchange = async (e) => {
                    const target = e.target as HTMLInputElement | null;
                    if (target && target.files) {
                      const file = target.files[0];
                      if (file) {
                        await handleAssetUpload('audio.src', file, 'audio');
                      }
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadStatus['audio.src']?.status === 'loading'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {uploadStatus['audio.src']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Audio'}
              </button>
            </div>
            {uploadStatus['audio.src']?.status === 'error' && (
              <p className="text-xs text-red-500 mt-1">Error: {uploadStatus['audio.src']?.error}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL Lirik (Opsional)</label>
          <div className="flex flex-col gap-2">
            {/* Upload button and input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                value={audio.lyricsSrc}
                onChange={(e) => updateState(s => ({ ...s, audio: { ...s.audio, lyricsSrc: e.target.value } }))}
                className="w-full sm:w-64 px-3 py-2 border rounded"
                placeholder="URL file lirik (LRC, TXT, etc.)"
              />
              <button
                type="button"
                onClick={async () => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'audio/*';
                  fileInput.onchange = async (e) => {
                    const target = e.target as HTMLInputElement | null;
                    if (target && target.files) {
                      const file = target.files[0];
                      if (file) {
                        await handleAssetUpload('audio.lyricsSrc', file, 'audio');
                      }
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadStatus['audio.lyricsSrc']?.status === 'loading'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {uploadStatus['audio.lyricsSrc']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Lirik'}
              </button>
            </div>
            {uploadStatus['audio.lyricsSrc']?.status === 'error' && (
              <p className="text-xs text-red-500 mt-1">Error: {uploadStatus['audio.lyricsSrc']?.error}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}