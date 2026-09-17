import React from "react";

type MetaSectionProps = {
  meta: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
  };
  updateState: (updater: (state: any) => any) => void;
  isValidURL: (str: string) => boolean;
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

export default function MetaSection({
  meta,
  updateState,
  isValidURL,
  getPublicUrl,
  uploadStatus,
  handleAssetUpload,
}: MetaSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Meta</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Judul</label>
          <input
            type="text"
            value={meta.title}
            onChange={(e) =>
              updateState((s: any) => ({
                ...s,
                meta: { ...s.meta, title: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            value={meta.description}
            onChange={(e) =>
              updateState((s: any) => ({
                ...s,
                meta: { ...s.meta, description: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL Undangan</label>
          <input
            type="text"
            value={meta.url}
            onChange={(e) =>
              updateState((s: any) => ({
                ...s,
                meta: { ...s.meta, url: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="https://example.com/undangan"
          />
          {!meta.url || isValidURL(meta.url) ? null : (
            <p className="text-xs text-red-500 mt-1">
              URL tidak valid
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">OG Image</label>
          <div className="flex flex-col gap-2">
            {/* Preview */}
            {meta.ogImage && (
              <div className="relative">
                <img
                  src={getPublicUrl(meta.ogImage)}
                  alt="OG Image"
                  className="w-32 h-32 object-cover rounded border"
                />
                {uploadStatus['meta.ogImage']?.status === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded">
                    <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-8 h-8"></div>
                  </div>
                )}
                {uploadStatus['meta.ogImage']?.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-sm">
                    Upload gagal: {uploadStatus['meta.ogImage']?.error}
                  </div>
                )}
              </div>
            )}
            {/* Upload button and input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                value={meta.ogImage}
                onChange={(e) =>
                  updateState((s: any) => ({
                    ...s,
                    meta: { ...s.meta, ogImage: e.target.value },
                  }))
                }
                className="w-full sm:w-64 px-3 py-2 border rounded"
                placeholder="URL gambar untuk media sosial"
              />
              <button
                type="button"
                onClick={async () => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = async (e) => {
                    const target = e.target as HTMLInputElement | null;
                    if (target && target.files) {
                      const file = target.files[0];
                      if (file) {
                        await handleAssetUpload('meta.ogImage', file, 'og');
                      }
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadStatus['meta.ogImage']?.status === 'loading'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {uploadStatus['meta.ogImage']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Gambar'}
              </button>
            </div>
            {(uploadStatus['meta.ogImage']?.status === 'error') && (
              <p className="text-xs text-red-500 mt-1">
                Error: {uploadStatus['meta.ogImage']?.error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}