import React from "react";

type CoverSectionProps = {
  cover: {
    image: string;
    label: string;
  };
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

export default function CoverSection({
  cover,
  updateState,
  getPublicUrl,
  uploadStatus,
  handleAssetUpload,
}: CoverSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Sampul</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">URL Gambar Sampul</label>
          <div className="flex flex-col gap-2">
            {/* Preview */}
            {cover.image && (
              <div className="relative">
                <img
                  src={getPublicUrl(cover.image)}
                  alt="Sampul"
                  className="w-32 h-32 object-cover rounded border"
                />
                {uploadStatus['cover.image']?.status === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded">
                    <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-8 h-8"></div>
                  </div>
                )}
                {uploadStatus['cover.image']?.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-sm">
                    Upload gagal: {uploadStatus['cover.image']?.error}
                  </div>
                )}
              </div>
            )}
            {/* Upload button and input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                value={cover.image}
                onChange={(e) => updateState(s => ({ ...s, cover: { ...s.cover, image: e.target.value } }))}
                className="w-full sm:w-64 px-3 py-2 border rounded"
                placeholder="URL gambar sampul"
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
                        await handleAssetUpload('cover.image', file, 'cover');
                      }
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadStatus['cover.image']?.status === 'loading'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {uploadStatus['cover.image']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Gambar'}
              </button>
            </div>
            {uploadStatus['cover.image']?.status === 'error' && (
              <p className="text-xs text-red-500 mt-1">Error: {uploadStatus['cover.image']?.error}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Label Sampul</label>
          <input
            type="text"
            value={cover.label}
            onChange={(e) => updateState(s => ({ ...s, cover: { ...s.cover, label: e.target.value } }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Teks overlay pada sampul"
          />
        </div>
      </div>
    </section>
  );
}