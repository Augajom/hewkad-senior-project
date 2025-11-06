import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import dayjs from "dayjs";
import { showUserPayment, showRejectPayment } from "./features/SweetAlertPayment";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const currencyTHB = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(n || 0));

const StatusChip = ({ text }) => {
  const map = {
    Pending: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    Completed: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    Rejected: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
    Default: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
  };
  const cls = map[text] || map.Default;
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{text}</span>;
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await axios.get(`${API}/admin/payment`, { withCredentials: true });
        setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
      } catch {
        setErr("Failed to load payments");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        [o.customer_username, o.rider_username, o.status_name, o.order_id?.toString()]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (statusFilter !== "All") {
      list = list.filter((o) => (o.status_name || "").toLowerCase() === statusFilter.toLowerCase());
    }
    if (sortBy === "Newest") list.sort((a, b) => new Date(b.ordered_at) - new Date(a.ordered_at));
    if (sortBy === "Oldest") list.sort((a, b) => new Date(a.ordered_at) - new Date(b.ordered_at));
    if (sortBy === "Amount High") list.sort((a, b) => Number(b.order_price || 0) - Number(a.order_price || 0));
    if (sortBy === "Amount Low") list.sort((a, b) => Number(a.order_price || 0) - Number(b.order_price || 0));
    return list;
  }, [orders, search, statusFilter, sortBy]);

  return (
    <AdminLayout title="Payments">
      <div className="grid md:grid-cols-3 gap-3 items-end mb-6">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search user, rider, status..."
            className="w-full h-12 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl pl-12 pr-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CiSearch className="absolute size-6 left-4 top-3.5 text-gray-400" />
        </div>
        <div className="flex gap-3">
          <select
            className="h-12 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Rejected</option>
          </select>
          <select
            className="h-12 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 w-full"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Amount High</option>
            <option>Amount Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-56 bg-[#171a1f] border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-rose-400 font-semibold mb-2">{err}</div>
          <div className="text-gray-400 text-sm">Please try again later</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#171a1f] p-12 text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((order) => (
              <div key={order.order_id} className="bg-[#171a1f] border border-gray-800 rounded-2xl p-5 flex flex-col hover:border-indigo-600/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Order #{order.order_id}</p>
                    <p className="text-base font-semibold text-gray-100 truncate">{order.customer_username}</p>
                    <p className="text-sm text-gray-400 truncate">Rider: {order.rider_username || "-"}</p>
                  </div>
                  <StatusChip text={order.status_name || "Unknown"} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-[#1f2330] border border-gray-800 p-3">
                    <p className="text-gray-400">Amount</p>
                    <p className="font-semibold text-gray-100">{currencyTHB(order.order_price)}</p>
                  </div>
                  <div className="rounded-xl bg-[#1f2330] border border-gray-800 p-3">
                    <p className="text-gray-400">Fee</p>
                    <p className="font-semibold text-gray-100">{currencyTHB(order.order_service_fee)}</p>
                  </div>
                  <div className="rounded-xl bg-[#1f2330] border border-gray-800 p-3 col-span-2">
                    <p className="text-gray-400">Date</p>
                    <p className="font-semibold text-gray-100">
                      {order.ordered_at ? dayjs(order.ordered_at).format("DD MMM YYYY • HH:mm") : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => showRejectPayment(order)}
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => showUserPayment(order.order_id)}
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Payment
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-gray-400">
            <span>Total: {filtered.length} orders</span>
            <span>Showing {Math.min(filtered.length, 16)} of {filtered.length}</span>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
