import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import RechargeModal from "../components/RechargeModal";
import { generateRaceResults, summarizeWins, generateBetSummary } from "../races/data";
import SnailWinsChart from "../races/BarChart";
import BetsDonutChart from "../races/DonutChart";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [showRecharge, setShowRecharge] = useState(false);

  const raceResults = useMemo(() => generateRaceResults(), []);
  const wins = useMemo(() => summarizeWins(raceResults), [raceResults]);
  const bets = useMemo(() => generateBetSummary(raceResults), [raceResults]);

  if (!user) return null;

  return (
  <div className="dashboard">
    <header className="dashboard-header">
      <h1>SNAIL RACE CLUB — Hola, {user.fullName}</h1>
      <button onClick={logout}>Cerrar sesión</button>
    </header>

    <section className="lane lane-balance">
      <div>
        <span className="amount-label">Saldo actual</span>
        <span className="amount">${user.balance.toFixed(2)}</span>
      </div>
      <button onClick={() => setShowRecharge(true)}>Cargar saldo</button>
    </section>

    <section className="lane lane-charts">
      <BetsDonutChart data={bets} />
      <SnailWinsChart data={wins} />
    </section>

    {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
  </div>
);
}