function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260101; 

export const SNAILS = [
  "Rayo",
  "Flash",
  "Baboso",
  "Turbo",
  "Lentísimo",
  "Cometa",
] as const;

export type SnailName = (typeof SNAILS)[number];

export interface RaceResult {
  raceNumber: number;
  winner: SnailName;
}

export interface SnailWins {
  snail: SnailName;
  wins: number;
}

export interface BetSummary {
  won: number;
  lost: number;
}

const TOTAL_RACES = 6;

export function generateRaceResults(): RaceResult[] {
  const rand = mulberry32(SEED);
  return Array.from({ length: TOTAL_RACES }, (_, i) => {
    const winnerIndex = Math.floor(rand() * SNAILS.length);
    return { raceNumber: i + 1, winner: SNAILS[winnerIndex] };
  });
}

export function summarizeWins(results: RaceResult[]): SnailWins[] {
  const counts = new Map<SnailName, number>(SNAILS.map((s) => [s, 0]));
  for (const r of results) counts.set(r.winner, (counts.get(r.winner) ?? 0) + 1);
  return SNAILS.map((snail) => ({ snail, wins: counts.get(snail) ?? 0 }));
}

export function generateBetSummary(results: RaceResult[]): BetSummary {
  const rand = mulberry32(SEED + 1);
  const totalBets = 10;
  let won = 0;
  for (let i = 0; i < totalBets; i++) {
    const pickedRace = results[i % results.length];
    const guessedRight = rand() < 1 / SNAILS.length;
    if (guessedRight && pickedRace) won++;
  }
  return { won, lost: totalBets - won };
}