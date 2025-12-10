import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export default function Chart({ data }) {
  const formatted = (data || []).map(d => ({ ts: new Date(d.ts).toLocaleString(), price: Number(d.price) }));
  return (
    <LineChart width={800} height={300} data={formatted}>
      <CartesianGrid />
      <XAxis dataKey="ts" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="price" />
    </LineChart>
  );
}
