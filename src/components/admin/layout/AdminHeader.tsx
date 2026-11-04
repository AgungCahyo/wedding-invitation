export function AdminHeader() {
  return (
    <div className="text-center space-y-3">
      <p className="eyebrow tracking-widest text-xs uppercase text-[var(--accent)]">
        Admin Panel
      </p>
      <h1 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
        Kelola Undangan
      </h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
        Buat link undangan personal dan pantau tanggapan RSVP tamu.
      </p>
    </div>
  );
}
