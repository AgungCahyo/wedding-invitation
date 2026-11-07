-- ============================================================
-- Leaderboard mini game "Catch the Love".
-- Satu baris per pemain (nama dinormalisasi huruf kecil) berisi skor terbaik.
-- RLS aktif TANPA policy: anon key tidak bisa baca/tulis langsung.
-- Semua akses lewat /api/game-scores (service-role) yang memvalidasi skor.
-- Jalankan di Supabase Dashboard → SQL Editor, SEBELUM deploy.
-- ============================================================

create table if not exists game_scores (
  name_key    text primary key,
  name        text not null check (char_length(name) between 1 and 40),
  score       integer not null check (score between 0 and 1000),
  plays       integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists game_scores_rank_idx
  on game_scores (score desc, updated_at asc);

alter table game_scores enable row level security;
