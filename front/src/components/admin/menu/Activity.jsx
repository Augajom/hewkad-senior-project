import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const currencyTHB = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(n || 0));

const StatusChip = ({ text }) => {
  const map =
    (text || "").toLowerCase() === "successfully" || (text || "").toLowerCase() === "complete"
      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
      : (text || "").toLowerCase().includes("report")
      ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
      : (text || "").toLowerCase().includes("ordering") || (text || "").toLowerCase().includes("received")
      ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30"
      : "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${map}`}>{text || "-"}</span>;
};

const PaymentChip = ({ text }) => {
  const t = (text || "").toLowerCase();
  const cls =
    t === "completed"
      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
      : t === "reject"
      ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
      : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
  const label = text || "Pending";
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

export default function AdminActivity() {
  const [pageType, setPageType] = useState("History");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErr("");
        const url = pageType === "History" ? `${API}/admin/history` : `${API}/admin/report`;
        const { data } = await axios.get(url, { withCredentials: true });
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        setErr("Failed to load data");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [pageType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [
        o.order_id?.toString(),
        o.customer_name,
        o.customer_email,
        o.customer_username,
        o.rider_name,
        o.rider_email,
        o.rider_username,
        o.status_name,
        o.status_payment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, search]);

  const revenueOf = (fee) => {
    const f = Number(fee || 0);
    return { admin: f * 0.3, rider: f * 0.7 };
  };

  const openSlipModal = (url) => {
    setSelectedSlip(url);
    setModalOpen(true);
  };

  return (
    <AdminLayout title="Activity">
      <div className="sticky top-0 z-30 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#0e1116]/70 backdrop-blur border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="relative">
            <p className="absolute top-2 left-4 text-gray-400 text-xs">Page</p>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              className="w-full bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 pb-2 pt-7"
            >
              <option value="History">History</option>
              <option value="Report">Report</option>
            </select>
          </div>
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, order ID, email, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[56px] bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl pl-12 pr-6"
            />
            <CiSearch className="absolute left-4 top-[15px] size-6 text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#171a1f] border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#171a1f] p-12 text-center text-rose-300">
          {err}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#171a1f] p-12 text-center text-gray-400">
          No data found
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl overflow-x-auto border border-gray-800 bg-[#111316]">
            <table className="w-full text-sm">
              <thead className="bg-[#1b1f2a] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Rider</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Fee</th>
                  <th className="px-4 py-3 text-left">Revenue</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-100">
                {filtered.map((o) => {
                  const rev = revenueOf(o.order_service_fee);
                  return (
                    <tr key={o.order_id} className="hover:bg-[#151922]">
                      <td className="px-4 py-3">#{o.order_id}</td>
                      <td className="px-4 py-3">{o.ordered_date || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name || "-"}</div>
                        <div className="text-xs text-gray-400">{o.customer_email || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.rider_name || "-"}</div>
                        <div className="text-xs text-gray-400">{o.rider_email || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip text={o.status_name} />
                      </td>
                      <td className="px-4 py-3">{currencyTHB(o.order_price)}</td>
                      <td className="px-4 py-3">{currencyTHB(o.order_service_fee)}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-300">{currencyTHB(rev.admin)}</div>
                        <div className="text-xs text-gray-400">Rider: {currencyTHB(rev.rider)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentChip text={o.status_payment} />
                      </td>
                      <td className="px-4 py-3">
                        {o.slip_filename ? (
                          <button
                            onClick={() => openSlipModal(`${API}/Files/Payment/${o.slip_filename}`)}
                            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-4">
            {filtered.map((o) => {
              const rev = revenueOf(o.order_service_fee);
              return (
                <div key={o.order_id} className="rounded-2xl border border-gray-800 bg-[#111316] p-4 text-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-400">Order #{o.order_id}</p>
                      <p className="text-lg font-semibold">{o.customer_name || "-"}</p>
                      <p className="text-xs text-gray-400">{o.customer_email || "-"}</p>
                    </div>
                    <StatusChip text={o.status_name} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-[#171a1f] border border-gray-800 p-3">
                      <p className="text-gray-400">Price</p>
                      <p className="font-semibold">{currencyTHB(o.order_price)}</p>
                    </div>
                    <div className="rounded-xl bg-[#171a1f] border border-gray-800 p-3">
                      <p className="text-gray-400">Fee</p>
                      <p className="font-semibold">{currencyTHB(o.order_service_fee)}</p>
                    </div>
                    <div className="rounded-xl bg-[#171a1f] border border-gray-800 p-3 col-span-2">
                      <p className="text-gray-400">Revenue</p>
                      <p className="font-semibold text-emerald-300">{currencyTHB(rev.admin)}</p>
                      <p className="text-xs text-gray-400">Rider: {currencyTHB(rev.rider)}</p>
                    </div>
                    <div className="rounded-xl bg-[#171a1f] border border-gray-800 p-3 col-span-2">
                      <p className="text-gray-400">Rider</p>
                      <p className="font-semibold">{o.rider_name || "-"}</p>
                      <p className="text-xs text-gray-400">{o.rider_email || "-"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <PaymentChip text={o.status_payment} />
                    {o.slip_filename ? (
                      <button
                        onClick={() => openSlipModal(`${API}/Files/Payment/${o.slip_filename}`)}
                        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        View Slip
                      </button>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-800 bg-[#111316] text-gray-100 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-[#171a1f] border border-gray-800 text-gray-300"
            >
              Close
            </button>
            <div className="p-4">
              {selectedSlip ? (
                <img src={selectedSlip} alt="Slip" className="max-h-[80vh] w-auto mx-auto rounded-xl" />
              ) : (
                <div className="p-12 text-center text-gray-400">No slip</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
