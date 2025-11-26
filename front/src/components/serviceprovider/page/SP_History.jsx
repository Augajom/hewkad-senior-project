import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/navbar.jsx";
import "../DaisyUI.css";

const API = "https://hewkad.com";

const statusBadge = (status) => {
  const base = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "Successfully":
    case "Complete":
      return `${base} bg-emerald-50 text-emerald-700`;
    case "Reported":
      return `${base} bg-rose-50 text-rose-700`;
    default:
      return `${base} bg-slate-100 text-slate-600`;
  }
};

const currency = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/service/history`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error");
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...historyList];
    if (statusFilter !== "All") rows = rows.filter((r) => (r.order_status || "").toLowerCase() === statusFilter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        [
          r.store_name,
          r.product,
          r.customer_name,
          r.customer_username,
          r.order_status,
          r.completed_at,
          r.order_id,
        ]
          .filter(Boolean)
          .some((v) => v.toString().toLowerCase().includes(q))
      );
    }
    return rows;
  }, [historyList, statusFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <header className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="tabs tabs-boxed bg-white/70">
              {["All", "Complete", "Reported"].map((s) => (
                <button
                  key={s}
                  className={`tab ${statusFilter === s ? "tab-active text-cyan-700" : "!text-gray-500"}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search in history"
              className="input input-bordered border border-gray-400 w-full bg-white/90 text-slate-900 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Order history
        </h2>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6">
            <div className="h-10 w-40 bg-slate-200/60 animate-pulse rounded mb-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-200/60 animate-pulse rounded mb-2" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 text-center">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
            No order history.
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full text-sm text-slate-900">
                <thead className="bg-slate-50/70 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">Store</th>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-center px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const total = Number(order.order_price || 0) + Number(order.order_service_fee || 0);
                    return (
                      <tr key={order.order_id} className="border-b border-slate-100/80 hover:bg-slate-50/60">
                        <td className="px-4 py-3">{order.store_name || "-"}</td>
                        <td className="px-4 py-3">{order.product || "-"}</td>
                        <td className="px-4 py-3 text-right">{currency(total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={statusBadge(order.order_status)}>{order.order_status || "-"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{order.customer_name || "-"}</div>
                          <div className="text-xs text-slate-500">{order.customer_username || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {order.completed_at
                            ? new Date(order.completed_at).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-200">
              {filtered.map((order) => {
                const total = Number(order.order_price || 0) + Number(order.order_service_fee || 0);
                return (
                  <div key={order.order_id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-black font-semibold">{order.store_name || "-"}</div>
                        <div className="text-black text-sm text-slate-600">{order.product || "-"}</div>
                      </div>
                      <span className={`${statusBadge(order.order_status)} flex-shrink-0`}>{order.order_status || "-"}</span>
                    </div>

                    {/* ✅ FIX: เปลี่ยนจาก grid-cols-2 เป็น flex justify-between ในแต่ละแถว */}
                    <div className="mt-3 space-y-2 text-sm">
                      {/* แถวที่ 1: ลูกค้า */}
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Customer</span>
                        <div className="text-right">
                          <div className="text-black font-medium truncate">{order.customer_name || "-"}</div>
                          <div className="text-xs text-slate-500 truncate">{order.customer_username || "-"}</div>
                        </div>
                      </div>
                      {/* แถวที่ 2: รวม */}
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Total</span>
                        <span className="text-black text-right font-semibold">{currency(total)}</span>
                      </div>
                      {/* แถวที่ 3: วันที่ */}
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Date</span>
                        <span className="text-right text-slate-600">
                          {order.completed_at
                            ? new Date(order.completed_at).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
