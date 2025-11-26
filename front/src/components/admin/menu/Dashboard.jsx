import React, { useEffect, useState } from "react";
import Nav from "../Nav";
import axios from "axios";
// Graph
import PostChart10Days from "./features/PostChart10Days";
// Icon
import { BiTrendingUp } from "react-icons/bi";
import { MdOutlinePending } from "react-icons/md";
import { LuShoppingCart } from "react-icons/lu";
import { GiFlatPlatform } from "react-icons/gi";
import { MdOutlineBorderColor } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
// Date-Range
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "../css/DatePickerStyles.css";

const formatCurrencyTHB = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n ?? 0);

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("All");
  const [customDate, setCustomDate] = useState({ start: null, end: null });
  const [markets, setMarkets] = useState([]);

  const [stats, setStats] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState("All");
  const [loading, setLoading] = useState(false);

  const getDateRange = (range) => {
    const now = new Date();
    let start = null;
    let end = null;

    switch (range) {
      case "Today":
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0
        );
        end = new Date(now);
        break;

      case "Yesterday": {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
        end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
        break;
      }

      case "This Week": {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0);
        end = new Date(now);
        break;
      }

      case "Last Week": {
      const d = new Date(now);
      const day = d.getDay(); // 0 = Sunday
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday this week
      const lastWeekStart = new Date(d.getFullYear(), d.getMonth(), diff - 7, 0, 0, 0);
      const lastWeekEnd = new Date(d.getFullYear(), d.getMonth(), diff - 1, 23, 59, 59);
      start = lastWeekStart;
      end = lastWeekEnd;
      break;
    }

      case "This Month":
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        end = new Date(now);
        break;

      case "Last Month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;

      case "This Year":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        end = new Date(now);
        break;

      case "Last Year":
        start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;

      default:
        start = null;
        end = null;
    }

    return { start, end };
  };

  const fetchMarkets = async () => {
    try {
      const res = await axios.get("https://hewkad.com:2053/kad", {
        withCredentials: true,
      });
      console.log(res.data)
      setMarkets(res.data);
    } catch (error) {
      console.error("❌ Error fetching markets:", error);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let start = null;
        let end = null;

        if (dateRange === "Custom Range") {
          start = customDate.start;
          end = customDate.end;
        } else {
          const range = getDateRange(dateRange);
          start = range.start;
          end = range.end;
        }

        const params = {
          kad_id: selectedMarket,
          start: start ? start.toLocaleDateString("en-CA") : "",
          end: end ? end.toLocaleDateString("en-CA") : "",
        };

        const { data } = await axios.get(
          "https://hewkad.com:2053/admin/dashboard-stats",
          {
            params,
            withCredentials: true,
          }
        );

        if (data.success) setStats(data.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
      setLoading(false);
    };

    if (dateRange === "Custom Range") {
      if (customDate.start && customDate.end) {
        fetchDashboardData();
      }
    } else {
      fetchDashboardData();
    }
  }, [dateRange, customDate.start, customDate.end, selectedMarket]);

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-slate-100 text-slate-900">
        <div className="container mx-auto mt-5 px-4 sm:px-10 lg:px-20">
          <div className="filter-con flex flex-col sm:flex-row items-center flex-wrap gap-6 w-full justify-center mb-8 p-6 bg-white rounded-2xl shadow-xl">
            <div className="relative w-full sm:w-auto sm:min-w-[220px]">
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none z-10">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="select select-bordered w-full rounded-xl border-slate-300 bg-slate-50 pl-28 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Year">This Year</option>
                <option value="Last Year">Last Year</option>
                <option value="Custom Range">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Pickers */}
            {dateRange === "Custom Range" && (
              <>
                <div className="relative w-full sm:w-auto">
                  <MdDateRange className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <DatePicker
                    selected={customDate.start}
                    onChange={(date) =>
                      setCustomDate((prev) => ({ ...prev, start: date }))
                    }
                    placeholderText="Start Date"
                    className="input input-bordered w-full sm:w-48 rounded-xl border-slate-300 bg-slate-50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                </div>
                <div className="relative w-full sm:w-auto">
                  <MdDateRange className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <DatePicker
                    selected={customDate.end}
                    onChange={(date) =>
                      setCustomDate((prev) => ({ ...prev, end: date }))
                    }
                    minDate={customDate.start}
                    placeholderText="End Date"
                    className="input input-bordered w-full sm:w-48 rounded-xl border-slate-300 bg-slate-50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                </div>
              </>
            )}

            {/* Market Select */}
            <div className="relative w-full sm:w-auto sm:min-w-[220px]">
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none z-10">
                Market
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="select select-bordered w-full rounded-xl border-slate-300 bg-slate-50 pl-20 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="All">All</option>
                {markets.map((market, index) => (
                    <option key={index} value={market.id}>
                      {market.kad_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Total Revenue"
              value={
                stats
                  ? `฿${stats.totalRevenue.toLocaleString()}`
                  : loading
                  ? "Loading..."
                  : "-"
              }
              icon={<BiTrendingUp className="size-6 text-white" />}
              iconBg="bg-gradient-to-r from-orange-400 to-orange-500"
            />

            <PostChart10Days />

            <StatCard
              title="Pending Revenue"
              value={
                stats
                  ? `฿${stats.pendingRevenue.toLocaleString()}`
                  : loading
                  ? "Loading..."
                  : "-"
              }
              icon={<MdOutlinePending className="size-6 text-white" />}
              iconBg="bg-gradient-to-r from-teal-400 to-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Paid Out To Shoppers"
              value={
                stats
                  ? `฿${stats.paidOutToShoppers.toLocaleString()}`
                  : loading
                  ? "Loading..."
                  : "-"
              }
              icon={<LuShoppingCart className="size-6 text-white" />}
              iconBg="bg-gradient-to-r from-pink-500 to-red-500"
            />
            <StatCard
              title="Platform Fees (30%)"
              value={
                stats
                  ? `฿${stats.platformFees.toLocaleString()}`
                  : loading
                  ? "Loading..."
                  : "-"
              }
              icon={<GiFlatPlatform className="size-6 text-white" />}
              iconBg="bg-gradient-to-r from-yellow-400 to-amber-500"
            />
            <StatCard
              title="Total Orders"
              value={stats ? stats.totalOrders : loading ? "Loading..." : "-"}
              icon={<MdOutlineBorderColor className="size-6 text-white" />}
              iconBg="bg-gradient-to-r from-purple-500 to-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Row 1 */}
            <StatusCard
              title="Available"
              value={stats?.statusCounts?.[1] || 0}
              bgColor="bg-blue-600"
            />
            <StatusCard
              title="Rider Received"
              value={stats?.statusCounts?.[2] || 0}
              bgColor="bg-sky-500"
            />
            <StatusCard
              title="Ordering"
              value={stats?.statusCounts?.[3] || 0}
              bgColor="bg-orange-500"
            />
            {/* Row 2 */}
            <StatusCard
              title="Order Received"
              value={stats?.statusCounts?.[4] || 0}
              bgColor="bg-yellow-500"
            />
            <StatusCard
              title="Complete"
              value={stats?.statusCounts?.[5] || 0}
              bgColor="bg-green-500"
            />
            <StatusCard
              title="Successfully"
              value={stats?.statusCounts?.[8] || 0}
              bgColor="bg-lime-500"
            />
            {/* Row 3 */}
            <StatusCard
              title="Reporting"
              value={stats?.statusCounts?.[6] || 0}
              bgColor="bg-cyan-500"
            />
            <StatusCard
              title="Reported"
              value={stats?.statusCounts?.[9] || 0}
              bgColor="bg-purple-600"
            />
            <StatusCard
              title="Reject"
              value={stats?.statusCounts?.[7] || 0}
              bgColor="bg-red-500"
            />
          </div>
        </div>
      </div>

    </>
  );
}

const StatCard = ({ title, value, icon, iconBg }) => (
  <div className="card bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col items-center justify-center">
    <div
      className={`icon-con size-10 rounded-lg flex items-center justify-center ${iconBg} shadow-lg mb-4`}
    >
      {icon}
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-500 m-0">{title}</p>
      <p className="text-3xl font-bold m-0 text-slate-900">{value}</p>
    </div>
  </div>
);

const StatusCard = ({ title, value, bgColor }) => (
  <div
    className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg text-white h-23 ${bgColor}`}
  >
    <p className="text-lg font-semibold m-0 opacity-90">{title}</p>
    <p className="text-3xl font-bold m-0">{value}</p>
  </div>
);