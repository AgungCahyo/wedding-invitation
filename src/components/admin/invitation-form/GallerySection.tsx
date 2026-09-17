import React from "react";
import type { GalleryImage } from "@/src/types/invitation";
import { NEUTRAL_IMAGE } from "@/src/lib/default-invitation";

type GallerySectionProps = {
  gallery: GalleryImage[];
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

const defaultGallery: GalleryImage = {
  id: 0,
  src: "",
  alt: "",
  aspect: "tall",
};

export default function GallerySection({
  gallery,
  updateState,
  getPublicUrl,
  uploadStatus,
  handleAssetUpload,
}: GallerySectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Galeri</h3>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => updateState(s => ({ ...s, gallery: [...s.gallery, defaultGallery] }))}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Tambah Gambar
        </button>
      </div>
      {gallery.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4 flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src={item.src || NEUTRAL_IMAGE}
              alt={item.alt || "Preview"}
              className="w-24 h-24 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = NEUTRAL_IMAGE;
              }}
            />
          </div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Gambar #{index + 1}</h4>
              <button
                type="button"
                onClick={() => updateState(s => {
                  const newGallery = [...s.gallery];
                  newGallery.splice(index, 1);
                  return { ...s, gallery: newGallery };
                })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Hapus
              </button>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">URL Gambar</label>
                <div className="flex flex-col gap-2">
                  {/* Preview */}
                  {item.src && (
                    <div className="relative">
                      <img
                        src={getPublicUrl(item.src)}
                        alt="Gallery Image"
                        className="w-24 h-24 object-cover rounded border"
                      />
                      {uploadStatus[`gallery.${index}.src`]?.status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded">
                          <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-8 h-8"></div>
                        </div>
                      )}
                      {uploadStatus[`gallery.${index}.src`]?.status === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-sm">
                          Upload gagal: {uploadStatus[`gallery.${index}.src`]?.error}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Upload button and input */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <input
                      type="text"
                      value={item.src}
                      onChange={(e) => {
                        const newGallery = [...gallery];
                        newGallery[index] = { ...newGallery[index], src: e.target.value };
                        updateState(s => ({ ...s, gallery: newGallery }));
                      }}
                      className="w-full sm:w-64 px-3 py-2 border rounded"
                      placeholder="URL gambar"
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
                              await handleAssetUpload(`gallery.${index}.src`, file, 'gallery');
                            }
                          }
                        };
                        fileInput.click();
                      }}
                      disabled={uploadStatus[`gallery.${index}.src`]?.status === 'loading'}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {uploadStatus[`gallery.${index}.src`]?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Gambar'}
                    </button>
                  </div>
                  {uploadStatus[`gallery.${index}.src`]?.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">Error: {uploadStatus[`gallery.${index}.src`]?.error}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alt Text</label>
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => {
                    const newGallery = [...gallery];
                    newGallery[index] = { ...newGallery[index], alt: e.target.value };
                    updateState(s => ({ ...s, gallery: newGallery }));
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
                <select
                  value={item.aspect}
                  onChange={(e) => {
                    const newGallery = [...gallery];
                    newGallery[index] = { ...newGallery[index], aspect: e.target.value as "tall" | "square" | "wide" };
                    updateState(s => ({ ...s, gallery: newGallery }));
                  }}
                  className="px-3 py-2 border rounded"
                >
                  <option value="tall">Tall</option>
                  <option value="square">Square</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
      {gallery.length === 0 && <p className="text-sm text-gray-500">Belum ada gambar galeri. Tambahkan gambar pertama di atas.</p>}
    </section>
  );
}