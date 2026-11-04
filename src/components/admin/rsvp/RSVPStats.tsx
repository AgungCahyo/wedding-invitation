import { Users, UserCheck, UserX, UtensilsCrossed } from "lucide-react";
import { StatCard } from "../shared/StatCard";

export function RSVPStats({
  stats,
}: {
  stats: {
    total: number;
    attending: number;
    notAttending: number;
    totalGuests: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={<Users size={18} />} label="Total Respon" value={stats.total} />
      <StatCard icon={<UserCheck size={18} />} label="Hadir" value={stats.attending} />
      <StatCard icon={<UserX size={18} />} label="Tidak Hadir" value={stats.notAttending} />
      <StatCard
        icon={<UtensilsCrossed size={18} />}
        label="Est. Porsi Catering"
        value={stats.totalGuests}
      />
    </div>
  );
}
