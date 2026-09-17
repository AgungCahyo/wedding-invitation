"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error for development purposes
  // In production, we don't expose details to the user
  if (process.env.NODE_ENV === "development") {
    console.error("Template error:", error);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Undangan tidak dapat dimuat
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Konfigurasi template undangan ini tidak valid.
        Silakan hubungi pemilik undangan.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Coba lagi
      </button>
    </main>
  );
}