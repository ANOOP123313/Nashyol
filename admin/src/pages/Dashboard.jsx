import { useState, useEffect } from "react";
import RevenueChart from "../components/RevenueChart";
import OrdersChart from "../components/OrdersChart";
import ReferralChart from "../components/ReferralChart";
import { dashboardAPI } from "../services/api";

import {
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  Gift,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topVendorsList, setTopVendorsList] = useState([]);
  const [charts, setCharts] = useState({ revenue: [], orders: [], referrals: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const dashboardData = await dashboardAPI.getAdminStats();

        setStats(dashboardData.stats || {});
        setCharts(dashboardData.charts || { revenue: [], orders: [], referrals: [] });
        setRecentOrders(dashboardData.recentOrders || []);
        setTopVendorsList(dashboardData.topVendors || []);
        setLeaderboard(dashboardData.leaderboard || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
        <p className="text-sm font-medium">Loading live dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-[15px] text-gray-500 mt-2 font-normal">
          Welcome back! Here's what's happening with your marketplace in real time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.revenue || 0).toLocaleString()}`}
          change="+15.3%"
          icon={DollarSign}
          iconBg="bg-orange-500"
        />

        <StatCard
          title="Total Orders"
          value={(stats?.orders || 0).toLocaleString()}
          change="+12.5%"
          icon={ShoppingBag}
          iconBg="bg-blue-500"
        />

        <StatCard
          title="Total Vendors"
          value={(stats?.vendors || 0).toLocaleString()}
          change="+8.2%"
          icon={Store}
          iconBg="bg-green-500"
        />

        <StatCard
          title="Total Customers"
          value={(stats?.customers || 0).toLocaleString()}
          change="+18.7%"
          icon={Users}
          iconBg="bg-purple-500"
        />

        <StatCard
          title="Referral Revenue"
          value={`₹${(stats?.referralRevenue || 0).toLocaleString()}`}
          change="+24.1%"
          icon={Gift}
          iconBg="bg-orange-400"
        />

        <StatCard
          title="Pending Approvals"
          value={(stats?.pendingApprovals || 0).toString()}
          change="-5.2%"
          negative
          icon={Clock}
          iconBg="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Revenue Overview" subtitle="Monthly revenue trend">
          <RevenueChart chartData={formatRevenueChartData(charts.revenue)} />
        </ChartWrapper>

        <ChartWrapper title="Orders Analytics" subtitle="Monthly order volume">
          <OrdersChart chartData={formatOrdersChartData(charts.orders)} />
        </ChartWrapper>
      </div>

      <ChartWrapper
        title="Referral Growth"
        subtitle="Referral signups vs conversions"
      >
        <ReferralChart chartData={formatReferralChartData(charts.referrals)} />
      </ChartWrapper>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrders orders={recentOrders} />
        <TopVendors vendorsList={topVendorsList} />
      </div>

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default Dashboard;

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatRevenueChartData = (data) =>
  data.map(({ _id, total }) => ({ month: monthNames[_id - 1] || _id, revenue: total }));

const formatOrdersChartData = (data) =>
  data.map(({ _id, count }) => ({ month: monthNames[_id - 1] || _id, orders: count }));

const formatReferralChartData = (data) =>
  data.map(({ _id, totalReferrals, conversions }) => ({
    month: monthNames[_id - 1] || _id,
    referrals: totalReferrals,
    conversions,
  }));

/* ================= STAT CARD ================= */

const StatCard = ({ title, value, change, negative, icon: Icon, iconBg }) => {
  return (
    <div
      className="
        bg-white rounded-xl p-6
        border border-gray-200
        flex justify-between items-start
        shadow-sm
        transition-all duration-300 ease-in-out
        hover:border-orange-500
        hover:ring-1
        hover:ring-orange-500/60
        cursor-pointer
      "
    >
      <div>
        <p className="text-[13px] text-gray-500 font-medium">
          {title}
        </p>
        <h2 className="text-[32px] font-bold mt-1 tracking-tight text-gray-900">
          {value}
        </h2>
        <p
          className={`text-[13px] mt-2 flex items-center gap-1 font-medium ${
            negative ? "text-red-500" : "text-green-500"
          }`}
        >
          {negative ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}

          {change}

          <span className="text-gray-500 ml-1">vs last month</span>
        </p>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon className="w-6 h-6 text-white stroke-[1.8]" />
      </div>
    </div>
  );
};

/* ================= CHART WRAPPER ================= */

const ChartWrapper = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl p-5 border">
    <h3 className="text-[18px] font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-[13px] text-gray-500 mb-5">{subtitle}</p>
    <div className="w-full h-[260px]">{children}</div>
  </div>
);

/* ================= RECENT ORDERS ================= */

const RecentOrders = ({ orders }) => {
  const displayOrders = orders || [];

  return (
    <div className="bg-white rounded-xl p-5 border lg:col-span-2">
      <div className="flex justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-gray-900">Recent Orders</h3>
        <a href="/orders" className="text-sm text-orange-500 font-medium">View all</a>
      </div>

      {displayOrders.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No recent orders yet.</div>
      ) : (
        <ul className="space-y-3">
          {displayOrders.map((order) => (
            <li
              key={order._id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">#{order._id?.slice(-8).toUpperCase()}</p>
                  {order.couponCode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-medium">
                      Coupon: {order.couponCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.user?.name || "Customer"} • {order.items?.length || 1} Item(s)
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">${(order.totalAmount || 0).toFixed(2)}</p>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.orderStatus || "Pending"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ================= TOP VENDORS ================= */

const TopVendors = ({ vendorsList }) => {
  const displayVendors = vendorsList || [];

  return (
    <div className="bg-white rounded-xl p-5 border">
      <h3 className="font-semibold mb-4 text-gray-900">Top Vendors</h3>

      {displayVendors.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No vendors registered yet.</div>
      ) : (
        <ul className="space-y-4">
          {displayVendors.map((vendor, i) => (
            <li key={vendor._id || i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(vendor.storeName || "V").charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{vendor.storeName || "Supplier"}</p>
                  <p className="text-xs text-gray-500">{vendor.email}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Verified
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ================= LEADERBOARD ================= */

const Leaderboard = ({ leaderboard }) => (
  <div className="bg-white rounded-xl p-5 border overflow-x-auto">
    <h3 className="text-[18px] font-semibold text-gray-900 mb-5">Top Referrers Leaderboard</h3>
    {leaderboard.length === 0 ? (
      <div className="py-8 text-center text-sm text-gray-400">
        No referrer leaderboard data available yet.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr><th className="py-3">Referrer</th><th>Referrals</th><th>Conversions</th><th>Rate</th></tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry._id} className="border-b last:border-0">
                <td className="py-3 text-gray-700">{entry._id || "Unknown"}</td>
                <td>{entry.referrals}</td>
                <td>{entry.conversions}</td>
                <td>{Number(entry.rate || 0).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);