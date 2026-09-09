import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const defaultEmptyData = [
  { month: "Jan", referrals: 0, conversions: 0 },
  { month: "Feb", referrals: 0, conversions: 0 },
  { month: "Mar", referrals: 0, conversions: 0 },
  { month: "Apr", referrals: 0, conversions: 0 },
  { month: "May", referrals: 0, conversions: 0 },
  { month: "Jun", referrals: 0, conversions: 0 },
];

const ReferralChart = ({ chartData }) => {
  const data = chartData && chartData.length > 0 ? chartData : defaultEmptyData;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="referrals"
          stroke="#f97316"
          strokeWidth={3}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="#22c55e"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ReferralChart;