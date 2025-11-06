import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const StatusChip = ({ status_id }) => {
  const isResolved = status_id === 5 || status_id === 8;
  const isUnresolved = status_id === 6 || status_id === 9 || status_id === 10;
  const label = isResolved ? "Resolved" : isUnresolved ? "Unresolved" : "Unknown";
  const cls = isResolved
    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
    : isUnresolved
    ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
    : "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

export default function ReportPage() {
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolvedDetail, setResolvedDetail] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/report`, { withCredentials: true });
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = reports.filter((r) => {
      const bucket =
        (r.customer_name || "") +
        " " +
        (r.customer_email || "") +
        " " +
        (r.rider_name || "") +
        " " +
        (r.rider_email || "") +
        " " +
        (r.report_detail || "") +
        " " +
        (r.resolved_detail || "") +
        " " +
        (r.order_id || "");
      return bucket.toLowerCase().includes(q);
    });
    if (statusFilter !== "All") {
      if (statusFilter === "Resolved") list = list.filter((r) => r.status_id === 5 || r.status_id === 8);
      if (statusFilter === "Unresolved") list = list.filter((r) => [6, 9, 10].includes(r.status_id));
    }
    if (sortBy === "Newest") list.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
    if (sortBy === "Oldest") list.sort((a, b) => new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0));
    return list;
  }, [reports, search, statusFilter, sortBy]);

  const openModal = (report) => {
    setSelectedReport(report);
    setResolvedDetail(report.resolved_detail || "");
    setFile(null);
    setModalOpen(true);
  };

  const submitResolve = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    const formData = new FormData();
    formData.append("resolved_detail", resolvedDetail);
    if (file) formData.append("file", file);
    await axios.put(`${API}/admin/report/${selectedReport.order_id}/resolve`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    setModalOpen(false);
    await load();
  };

  return (
    <AdminLayout title="Reports">
      <div className="sticky top-0 z-30 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#0e1116]/70 backdrop-blur border-b border-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">Reports</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer, rider, detail..."
                className="h-11 w-72 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl pl-11 pr-4 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="absolute size-5 left-3 top-3.5 text-gray-400" />
            </div>
            <select
              className="h-11 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Resolved</option>
              <option>Unresolved</option>
            </select>
            <select
              className="h-11 bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl px-4 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#171a1f] border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#171a1f] p-12 text-center text-gray-400">
          No reports found
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#111316]">
          <table className="w-full text-sm">
            <thead className="bg-[#1b1f2a] text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Rider</th>
                <th className="px-4 py-3 text-left">Report Detail</th>
                <th className="px-4 py-3 text-left">Resolved Detail</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-100">
              {filtered.map((r) => (
                <tr key={r.order_id} className="hover:bg-[#151922]">
                  <td className="px-4 py-3">#{r.order_id}</td>
                  <td className="px-4 py-3">{r.date || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.customer_name || "-"}</div>
                    <div className="text-xs text-gray-400">{r.customer_email || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.rider_name || "-"}</div>
                    <div className="text-xs text-gray-400">{r.rider_email || "-"}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="line-clamp-2 text-gray-300">{r.report_detail || "-"}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="line-clamp-2 text-gray-300">{r.resolved_detail || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status_id={r.status_id} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status_id === 6 ? (
                      <button
                        onClick={() => openModal(r)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Resolve
                      </button>
                    ) : r.resolved_file ? (
                      <a
                        href={`${API}${r.resolved_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111316] text-gray-100 shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold">Resolve • Order #{selectedReport?.order_id}</h3>
            </div>
            <form onSubmit={submitResolve} className="p-6 space-y-4">
              <textarea
                rows="4"
                className="w-full rounded-xl bg-[#171a1f] border border-gray-800 text-gray-100 p-3 outline-none focus:border-indigo-600"
                placeholder="Detail of resolution..."
                value={resolvedDetail}
                onChange={(e) => setResolvedDetail(e.target.value)}
              />
              <input
                type="file"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-500/15 file:text-indigo-300 hover:file:bg-indigo-500/25"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#171a1f] border border-gray-800 text-gray-200 hover:bg-[#1a1f29]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
