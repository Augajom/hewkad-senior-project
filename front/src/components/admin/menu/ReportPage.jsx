import React, { useState, useEffect } from "react";
import Nav from "../nav";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

function ReportPage() {
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolvedDetail, setResolvedDetail] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/admin/report", {
        withCredentials: true,
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setResolvedDetail(report.resolved_detail || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    const formData = new FormData();
    formData.append("resolved_detail", resolvedDetail);
    if (file) formData.append("file", file);

    try {
      await axios.put(
        `http://localhost:5000/admin/report/${selectedReport.order_id}/resolve`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("แก้ไขรายงานสำเร็จ!");
      setModalOpen(false);
      fetchReports();
    } catch (err) {
      console.error("Error updating report:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.rider_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.order_id?.toString().includes(search)
  );

  const getStatusClass = (status) => {
    if (status === 5 || status === 8)
      return "text-green-600 font-semibold"; // ✅ Resolved
    if (status === 6 || status === 9 || status === 10)
      return "text-red-500 font-semibold"; // Unresolved
    return "text-gray-500";
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col">
            <h1 className="text-3xl font-bold mb-6 text-center">Report Management</h1>

            {/* Search */}
            <div className="search-con relative mb-6 flex justify-end">
              <input
                type="text"
                placeholder="Search by name or order ID..."
                className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="absolute size-6 right-4 top-[18px]" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-2xl rounded-lg p-6">
              <table className="w-full text-sm text-center text-black">
                <thead className="bg-gray-200 text-black uppercase text-sm">
                  <tr className="border-b">
                    <th className="px-10 py-3">Order ID</th>
                    <th className="px-10 py-3">Date</th>
                    <th className="px-10 py-3">Report By (Customer)</th>
                    <th className="px-10 py-3">Report User (Rider)</th>
                    <th className="px-10 py-3">Report Detail</th>
                    <th className="px-10 py-3">Resolved Detail</th>
                    <th className="px-10 py-3">Status</th>
                    <th className="px-10 py-3">Action</th> {/* ✅ เพิ่ม Action */}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.order_id} className="border-b">
                        <td>{report.order_id}</td>
                        <td>{report.date || "-"}</td>
                        <td>
                          {report.customer_name || "-"}
                          <div className="text-gray-400 text-xs">
                            {report.customer_email || "-"}
                          </div>
                        </td>
                        <td>
                          {report.rider_name || "-"}
                          <div className="text-gray-400 text-xs">
                            {report.rider_email || "-"}
                          </div>
                        </td>
                        <td className="text-center px-4">
                          {report.report_detail || "-"}
                        </td>
                        <td className="text-center px-4">
                          {report.resolved_detail || "-"}
                        </td>
                        <td className={getStatusClass(report.status_id)}>
                          {report.status_id === 5 || report.status_id === 8
                            ? "Resolved"
                            : report.status_id === 6 || report.status_id === 9 || report.status_id === 10
                              ? "Unresolved"
                              : "-"}
                        </td>
                        <td>
                          {report.status_id === 6 ? (
                            <button
                              onClick={() => handleOpenModal(report)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                              แก้ไข
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-gray-500 py-10">
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

      {/* ✅ Modal สำหรับแก้ไข Report */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[500px] shadow-lg">
            <h2 className="text-2xl font-bold mb-4">แก้ไขรายงาน #{selectedReport.order_id}</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                rows="4"
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                placeholder="รายละเอียดการแก้ไข..."
                value={resolvedDetail}
                onChange={(e) => setResolvedDetail(e.target.value)}
              />
              <input
                type="file"
                className="mb-4"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportPage;
