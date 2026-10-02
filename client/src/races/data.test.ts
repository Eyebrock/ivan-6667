import { describe, it, expect } from "vitest";
import { generateRaceResults, summarizeWins, generateBetSummary, SNAILS } from "./data";

describe("datos simulados de carreras", () => {
  it("genera exactamente 6 carreras con un ganador válido cada una", () => {
    const results = generateRaceResults();
    expect(results).toHaveLength(6);
    for (const r of results) expect(SNAILS).toContain(r.winner);
  });

  it("las victorias por caracol suman exactamente 6", () => {
    const results = generateRaceResults();
    const wins = summarizeWins(results);
    const total = wins.reduce((sum, w) => sum + w.wins, 0);
    expect(total).toBe(6);
  });

  it("es determinista: misma semilla, mismo resultado", () => {
    expect(generateRaceResults()).toEqual(generateRaceResults());
  });

  it("ganadas + perdidas suman el total de apuestas simuladas", () => {
    const results = generateRaceResults();
    const bets = generateBetSummary(results);
    expect(bets.won + bets.lost).toBe(10);
  });
});