import { invitation } from "@/src/data/invitation";

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getJakartaTimestamp(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: invitation.wedding.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
}

export function getWeddingTargetTimestamp(): number {
  const [year, month, day] = invitation.wedding.date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const jakartaOffset = getJakartaTimestamp(target) - target.getTime();
  return target.getTime() + jakartaOffset;
}

export function calculateTimeRemaining(): TimeRemaining {
  const now = getJakartaTimestamp(new Date());
  const target = getWeddingTargetTimestamp();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
  };
}
