import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { BetSummary } from "./data";

interface Props {
  data: BetSummary;
}

const COLORS = { won: "#22c55e", lost: "#ef4444" };

export default function BetsDonutChart({ data }: Props) {
  const chartData = [
    { name: "Ganadas", value: data.won, key: "won" as const },
    { name: "Perdidas", value: data.lost, key: "lost" as const },
  ];

  return (
    <div>
      <h3>Apuestas ganadas vs perdidas</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}