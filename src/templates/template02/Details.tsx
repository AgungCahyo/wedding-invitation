interface SectionProps {
  guestName?: string;
  invitation?: any;
}

/** Template 02 proof-of-concept section: event details in a flat, hairline-ruled list. */
export function Details({ invitation }: SectionProps) {
  const { wedding } = invitation;

  return (
    <section className="px-6 md:px-16 py-16 md:py-24 max-w-3xl">
      <p className="t02-eyebrow mb-6">Detail Acara</p>
      <dl className="flex flex-col gap-4">
        <div className="t02-hairline pt-4 flex justify-between gap-4">
          <dt className="font-body text-sm text-[var(--text-tertiary)]">Tanggal</dt>
          <dd className="font-body text-sm md:text-base text-[var(--text-primary)] text-right">
            {wedding.displayDate}
          </dd>
        </div>
      </dl>
    </section>
  );
}