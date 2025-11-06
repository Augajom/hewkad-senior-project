import React, { useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineBorderColor, MdDateRange, MdOutlinePending } from "react-icons/md";
import { BiTrendingUp } from "react-icons/bi";

const formatCurrencyTHB = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n ?? 0);

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("All");
  const [customDate, setCustomDate] = useState({ start: null, end: null });
  const [postFilter, setPostFilter] = useState("All");

  const stats = useMemo(
    () => [
      { icon: <BiTrendingUp className="text-xl" />, title: "Total Revenue", value: formatCurrencyTHB(220015), color: "bg-orange-500/90" },
      { icon: <MdOutlinePending className="text-xl" />, title: "Pending Revenue", value: formatCurrencyTHB(2546), color: "bg-emerald-500/90" },
      { icon: <MdOutlineBorderColor className="text-xl" />, title: "Total Orders", value: "1,015", color: "bg-violet-500/90" },
    ],
    []
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Date Range</p>
          <MdDateRange className="absolute left-4 bottom-3 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-11 pt-7 pb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option>All</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
            <option>Last Year</option>
            <option>Custom Range</option>
          </select>

          {dateRange === "Custom Range" && (
            <div className="flex gap-2 mt-2">
              <DatePicker
                selected={customDate.start}
                onChange={(d) => setCustomDate((p) => ({ ...p, start: d }))}
                selectsStart
                startDate={customDate.start}
                endDate={customDate.end}
                placeholderText="Start"
                className="w-full bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 py-2"
                calendarClassName="!bg-[#171a1f] !text-gray-100"
              />
              <DatePicker
                selected={customDate.end}
                onChange={(d) => setCustomDate((p) => ({ ...p, end: d }))}
                selectsEnd
                startDate={customDate.start}
                endDate={customDate.end}
                minDate={customDate.start}
                placeholderText="End"
                className="w-full bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 py-2"
                calendarClassName="!bg-[#171a1f] !text-gray-100"
              />
            </div>
          )}
        </div>

        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Posts</p>
          <select
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="w-full bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 pt-7 pb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option>All</option>
            <option>กาดหน้ามอ</option>
            <option>กาดในมอ</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {stats.map((box, i) => (
          <div
            key={i}
            className="bg-[#171a1f] border border-gray-800 rounded-2xl p-6 flex items-center gap-4 hover:border-indigo-600/40 transition"
          >
            <div className={`w-12 h-12 ${box.color} rounded-xl grid place-items-center text-white`}>{box.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{box.title}</p>
              <p className="text-2xl font-bold text-gray-100">{box.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#171a1f]">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-100 font-semibold">Overview</h3>
          <span className="text-xs text-gray-400">Filtered: {postFilter} • {dateRange}</span>
        </div>
        <div className="p-5 text-sm text-gray-400">
          ไม่มีข้อมูลแสดงในส่วนนี้ กดเลือกช่วงวันที่/โพสต์เพื่อดูภาพรวมรายละเอียด
        </div>
      </div>
    </AdminLayout>
  );
}
