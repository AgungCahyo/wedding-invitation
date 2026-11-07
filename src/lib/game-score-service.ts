export interface LeaderboardEntry {
  name: string;
  score: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/game-scores", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat leaderboard.");
  const json = (await res.json()) as { scores: LeaderboardEntry[] };
  return json.scores;
}

export async function submitScore(name: string, score: number) {
  const res = await fetch("/api/game-scores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, score }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    isNewBest?: boolean;
    scores?: LeaderboardEntry[];
  };
  if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan skor.");
  return { isNewBest: Boolean(json.isNewBest), scores: json.scores ?? [] };
}
