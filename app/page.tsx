import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <h1 className="mb-6 text-4xl font-bold text-gray-900">
        Undangan Digital
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Platform undangan digital yang modern, responsif, dan mudah digunakan.
        Buat undangan pernikahan Anda dengan fitur RSVP, wish list, dan tamu digital.
      </p>
      <div className="mb-12 space-x-6">
        <Link
          href="/ayutika"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
          Lihat Template Ayutika
        </Link>
        <Link
          href="/template02-runtime-test"
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          Lihat Template 02
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Ayutika
          </h2>
          <p className="text-gray-600">
            Template klasik dengan elemen tradisional dan desain yang elegan.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Template 02
          </h2>
          <p className="text-gray-600">
            Template modern dengan layout yang dinamis dan interaktif.
          </p>
        </div>
      </div>
      <p className="mt-12 text-sm text-gray-500">
        Catatan: Template 02 runtime test hanya dapat diakses dengan slug
        <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">
          template02-runtime-test
        </code>
        setelah fixture diterapkan ke database.
      </p>
    </main>
  );
}