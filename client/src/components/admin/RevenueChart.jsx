import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₹${v}`} />
        <Tooltip
          contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '8px' }}
          formatter={(v) => [`₹${v}`, 'Revenue']}
        />
        <Line type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
