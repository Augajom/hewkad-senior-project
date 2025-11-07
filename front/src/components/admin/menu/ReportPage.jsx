import React, { useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import Nav from "../nav";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const StatusChip = ({ status_id }) => {
  const isResolved = [5, 8, 9].includes(status_id); // ✅ 9 เป็น Resolved
  const isUnresolved = [6].includes(status_id);
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
  const [submitting, setSubmitting] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, fileUrl: "", title: "" });

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

    const shouldReopen = [2, 3, 4].includes(selectedReport.reason_id);
    if (shouldReopen) formData.append("change_status", "Ordering");

    try {
      setSubmitting(true); // ✅ เริ่ม loading

      await axios.put(
        `${API}/admin/report/${selectedReport.order_id}/resolve`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      if (shouldReopen) {
        alert("รายงานนี้ต้องแก้งานอีกครั้ง! Rider จะได้รับอีเมลแจ้งเตือนให้ไปแก้งาน");
      } else {
        alert("แก้ไขรายงานสำเร็จ! ลูกค้าจะได้รับอีเมลแจ้งเตือน");
      }

      setModalOpen(false);
      load();
    } catch (err) {
      console.error("Error updating report:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setSubmitting(false); // ✅ จบ loading
    }
  };


  const filteredReports = useMemo(() => {
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
      if (statusFilter === "Resolved") list = list.filter((r) => [5, 8, 9].includes(r.status_id));
      if (statusFilter === "Unresolved") list = list.filter((r) => [6,].includes(r.status_id));
    }

    if (sortBy === "Newest") list.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
    if (sortBy === "Oldest") list.sort((a, b) => new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0));

    return list;
  }, [reports, search, statusFilter, sortBy]);


  const getStatusClass = (status) => {
    if ([5, 8, 9].includes(status)) return "text-green-600 font-semibold"; // ✅ 9 เป็น Resolved
    if ([6].includes(status)) return "text-red-500 font-semibold";
    return "text-gray-500";
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Report Management
            </h1>

            <div className="relative w-full sm:w-96 mb-8">
              <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search by name, email, or order ID..."
                className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-6">
              <table className="w-full text-sm text-center text-slate-800">
                <thead className="bg-transparent text-slate-600 uppercase text-xs">
                  <tr className="border-b border-slate-300">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Report By (Customer)</th>
                    <th className="px-4 py-3">Report User (Rider)</th>
                    <th className="px-4 py-3">Report Detail</th>
                    <th className="px-4 py-3">Report File</th>
                    <th className="px-4 py-3">Resolved Detail</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr
                        key={report.order_id}
                        className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50"
                      >
                        <td className="p-4">{report.order_id}</td>
                        <td className="p-4">{report.date || "-"}</td>
                        <td className="p-4">
                          {report.customer_name || "-"}
                          <div className="text-slate-400 text-xs">{report.customer_email || "-"}</div>
                        </td>
                        <td className="p-4">
                          {report.rider_name || "-"}
                          <div className="text-slate-400 text-xs">{report.rider_email || "-"}</div>
                        </td>
                        <td className="p-4 text-center">{report.report_detail || "-"}</td>

                        {/* เพิ่ม column report_file */}
                        {/* Column Report File */}
                        <td className="p-4 text-center">
                          {report.report_file ? (
                            <button
                              onClick={() =>
                                setViewModal({ open: true, fileUrl: `http://localhost:5000${report.report_file}`, title: "Report File" })
                              }
                              className="text-blue-600 underline hover:text-blue-800 text-sm cursor-pointer"
                            >
                              View Report
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="p-4 text-center">{report.resolved_detail || "-"}</td>
                        <td className={`p-4 ${getStatusClass(report.status_id)}`}>
                          {report.status_id === 5 || report.status_id === 8 || report.status_id === 9
                            ? "Resolved"
                            : [6,].includes(report.status_id)
                              ? "Unresolved"
                              : "-"}
                        </td>
                        <td className="p-4">
                          {report.status_id === 6 ? (
                            <button
                              onClick={() => openModal(report)}
                              className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"
                            >
                              Resolve
                            </button>
                          ) : report.resolved_file ? (
                            <button
                              onClick={() =>
                                setViewModal({
                                  open: true,
                                  fileUrl: `http://localhost:5000${report.resolved_file}`,
                                  title: "Resolved File",
                                })
                              }
                              className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20"
                            >
                              View File
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-slate-500 py-10">
                        ไม่มีรายงานในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
      {viewModal.open && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black max-w-md w-full">
            <h3 className="font-bold text-lg text-center mb-4">{viewModal.title}</h3>

            <div className="flex justify-center mb-6">
              <img
                src={viewModal.fileUrl}
                alt={viewModal.title}
                className="max-w-full max-h-[400px] object-contain rounded"
              />
            </div>

            <div className="flex justify-center">
              <button
                className="btn btn-error text-white px-8 py-3 rounded-full"
                onClick={() => setViewModal({ open: false, fileUrl: "", title: "" })}
              >
                ปิด
              </button>
            </div>
          </div>
        </dialog>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[999]">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-lg relative">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Resolve Report Order {selectedReport?.order_id}
            </h2>

            <form onSubmit={submitResolve} className="space-y-6">
              <textarea
                rows="4"
                className="textarea textarea-bordered w-full rounded-xl border-slate-300 bg-white/50 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                placeholder="Detail of resolution..."
                value={resolvedDetail}
                onChange={(e) => setResolvedDetail(e.target.value)}
              />
              <input
                type="file"
                className="file-input file-input-bordered w-full rounded-xl border-slate-300 bg-white/50 text-black
                           file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                           file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white
                           hover:file:opacity-90 file:cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="flex justify-end gap-3 pt-2">
                {!submitting && (
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/30 hover:shadow-red-500/50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Resolution"}
                </button>
              </div>
            </form>

            <button
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg text-red-500 text-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-all z-10"
              onClick={() => setModalOpen(false)}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
