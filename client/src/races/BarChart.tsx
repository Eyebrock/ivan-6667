import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { SnailWins } from "./data";

interface Props {
  data: SnailWins[];
}

export default function SnailWinsChart({ data }: Props) {
  return (
    <div>
      <h3>Victorias por caracol (día simulado, 6 carreras)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="snail" />
          <YAxis allowDecimals={false} domain={[0, 6]} />
          <Tooltip formatter={(value: unknown) => [`${value ?? 0} victoria(s)`, ""]} />
          <Bar dataKey="wins" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}