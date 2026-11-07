/** "2026-12-04" → { day: 4, month: "Desember", year: 2026 } (tanpa efek zona waktu). */
export function splitEventDate(dateISO: string) {
  const [year, m, day] = dateISO.split("-").map(Number);
  const month = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(year, m - 1, 1)
  );
  return { day, month, year };
}

/** "Jumat, 4 Desember 2026" */
export function formatEventDate(dateISO: string, dayName?: string) {
  const { day, month, year } = splitEventDate(dateISO);
  return `${dayName ? `${dayName}, ` : ""}${day} ${month} ${year}`;
}
