import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const defaultEmptyData = [
  { month: "Jan", orders: 0 },
  { month: "Feb", orders: 0 },
  { month: "Mar", orders: 0 },
  { month: "Apr", orders: 0 },
  { month: "May", orders: 0 },
  { month: "Jun", orders: 0 },
];

const OrdersChart = ({ chartData }) => {
  const data = chartData && chartData.length > 0 ? chartData : defaultEmptyData;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrdersChart;