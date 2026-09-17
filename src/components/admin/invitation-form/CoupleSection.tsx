import React from "react";

type CoupleSectionProps = {
  couple: {
    groom: {
      name: string;
      fullName: string;
      parents: string[];
      photo: string;
      socialLinks: { instagram?: string };
    };
    bride: {
      name: string;
      fullName: string;
      parents: string[];
      photo: string;
      socialLinks: { instagram?: string };
    };
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

export default function CoupleSection({
  couple,
  updateState,
  getPublicUrl,
  uploadStatus,
  handleAssetUpload,
}: CoupleSectionProps) {
  return (
    <section className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Pasangan</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Groom */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Pria</h4>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={couple.groom.name}
                onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, groom: { ...s.couple.groom, name: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={couple.groom.fullName}
                onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, groom: { ...s.couple.groom, fullName: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Orang Tua (pisahkan dengan koma)</label>
              <input
                type="text"
                value={couple.groom.parents.join(", ")}
                onChange={(e) => {
                  const parents = e.target.value.split(",").map(p => p.trim()).filter(p => p);
                  updateState(s => ({ ...s, couple: { ...s.couple, groom: { ...s.couple.groom, parents } } }));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="Bapak, Ibu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foto</label>
              <div className="flex flex-col gap-2">
                {/* Preview */}
                {couple.groom.photo && (
                  <div className="relative">
                    <img
                      src={getPublicUrl(couple.groom.photo)}
                      alt="Groom Photo"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    {uploadStatus['couple.groom.photo']?.status === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded">
                        <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-8 h-8"></div>
                      </div>
                    )}
                    {uploadStatus['couple.groom.photo']?.status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-sm">
                        Upload gagal: {uploadStatus['couple.groom.photo']?.error}
                      </div>
                    )}
                  </div>
                )}
                {/* Upload button and input */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="text"
                    value={couple.groom.photo}
                    onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, groom: { ...s.couple.groom, photo: e.target.value } } }))}
                    className="w-full sm:w-64 px-3 py-2 border rounded"
                    placeholder="URL foto"
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
                            await handleAssetUpload('couple.groom.photo', file, 'groom');
                          }
                        }
                      };
                      fileInput.click();
                    }}
                    disabled={uploadStatus['couple.groom.photo']?.status === 'loading'}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploadStatus['couple.groom.photo']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Gambar'}
                  </button>
                </div>
                {uploadStatus['couple.groom.photo']?.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">Error: {uploadStatus['couple.groom.photo']?.error}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={couple.groom.socialLinks.instagram}
                onChange={(e) => {
                  const updatedSocialLinks = {
                    ...couple.groom.socialLinks,
                    instagram: e.target.value
                  };
                  const updatedGroom = {
                    ...couple.groom,
                    socialLinks: updatedSocialLinks
                  };
                  const updatedCouple = {
                    ...couple,
                    groom: updatedGroom
                  };
                  updateState(s => ({...s, couple: updatedCouple}));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        {/* Bride */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Wanita</h4>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={couple.bride.name}
                onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, bride: { ...s.couple.bride, name: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={couple.bride.fullName}
                onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, bride: { ...s.coupe.bride, fullName: e.target.value } } }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Orang Tua (pisahkan dengan koma)</label>
              <input
                type="text"
                value={couple.bride.parents.join(", ")}
                onChange={(e) => {
                  const parents = e.target.value.split(",").map(p => p.trim()).filter(p => p);
                  updateState(s => ({ ...s, couple: { ...s.couple, bride: { ...s.couple.bride, parents } } }));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="Bapak, Ibu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foto</label>
              <div className="flex flex-col gap-2">
                {/* Preview */}
                {couple.bride.photo && (
                  <div className="relative">
                    <img
                      src={getPublicUrl(couple.bride.photo)}
                      alt="Bride Photo"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    {uploadStatus['couple.bride.photo']?.status === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded">
                        <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-8 h-8"></div>
                      </div>
                    )}
                    {uploadStatus['couple.bride.photo']?.status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-sm">
                        Upload gagal: {uploadStatus['couple.bride.photo']?.error}
                      </div>
                    )}
                  </div>
                )}
                {/* Upload button and input */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="text"
                    value={couple.bride.photo}
                    onChange={(e) => updateState(s => ({ ...s, couple: { ...s.couple, bride: { ...s.couple.bride, photo: e.target.value } } }))}
                    className="w-full sm:w-64 px-3 py-2 border rounded"
                    placeholder="URL foto"
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
                            await handleAssetUpload('couple.bride.photo', file, 'bride');
                          }
                        }
                      };
                      fileInput.click();
                    }}
                    disabled={uploadStatus['couple.bride.photo']?.status === 'loading'}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploadStatus['couple.bride.photo']?.status === 'loading' ? 'Sedang diunggah...' : 'Unggah Gambar'}
                  </button>
                </div>
                {uploadStatus['couple.bride.photo']?.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">Error: {uploadStatus['couple.bride.photo']?.error}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={couple.bride.socialLinks.instagram}
                onChange={(e) => {
                  const updatedSocialLinks = {
                    ...couple.bride.socialLinks,
                    instagram: e.target.value
                  };
                  const updatedBride = {
                    ...couple.bride,
                    socialLinks: updatedSocialLinks
                  };
                  const updatedCouple = {
                    ...couple,
                    bride: updatedBride
                  };
                  updateState(s => ({...s, couple: updatedCouple}));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="@username"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}