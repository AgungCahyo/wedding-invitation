export default function UnregisterInvitationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Undangan Tidak Tersedia
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Undangan yang Anda cari tidak tersedia atau telah dihapus.
        Jika Anda adalah pemilik undangan, silakan periksa status undangan Anda.
      </p>
      <p className="mb-6 text-sm text-gray-500">
        Jika Anda mengakses ini dari sebuah tautan, mungkin tautan tersebut sudah kedaluwarsa.
      </p>
    </main>
  );
}