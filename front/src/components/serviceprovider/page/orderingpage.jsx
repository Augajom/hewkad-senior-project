import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar.jsx";
import "../DaisyUI.css";

const API = "http://localhost:5000";

const statusColors = {
  "Rider Received": "bg-blue-500 text-white",
  Ordering: "bg-orange-500 text-white",
  "Order Received": "bg-green-500 text-white",
  Cancel: "bg-red-500 text-white",
};

const resolveImg = (src) => {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  return `${API}${src.startsWith("/") ? src : `/${src}`}`;
};

const OrderingCard = ({ order, onStatusUpdate }) => {
  const fileInputRef = React.useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [reportForm, setReportForm] = useState({
    report: "",
    details: "",
    image: null,
  });

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  // โหลดเหตุผลสำหรับ report
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const res = await fetch(`${API}/customer/report-reasons`, {
          credentials: "include",
        });
        const data = await res.json();
        setReportReasons(data);
      } catch (err) {
        console.error("Load report reasons error:", err);
      }
    };
    fetchReasons();
  }, []);

  // ส่ง report / cancel
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setLoadingCancel(true); // เริ่ม loading
    try {
      const fd = new FormData();
      fd.append("post_id", order.post_id || order.id);
      fd.append("reason_id", reportForm.report);
      fd.append("detail", reportForm.details);
      if (reportForm.image) fd.append("image", reportForm.image);

      const res = await fetch(`${API}/service/cancel`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Submit cancel report failed");
      }

      const data = await res.json();
      alert("ส่งรายงานสำเร็จ! ออเดอร์ถูกยกเลิกแล้ว");

      // อัปเดตสถานะ order ใน frontend
      if (onStatusUpdate) {
        onStatusUpdate(order.id, "Cancel", data.report_file ? `${API}${data.report_file}` : null, 10);
      }

      setShowReportModal(false);
      setReportForm({ report: "", details: "", image: null });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingCancel(false); // ปิด loading
    }
  };

  // แนบหลักฐานการชำระเงิน
  const handleSendClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("proof", file);

    try {
      const res = await fetch(`${API}/service/orders/${order.id}/upload-proof`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ แนบหลักฐานสำเร็จ!");
        if (onStatusUpdate)
          onStatusUpdate(order.id, data.status, `${API}${data.proof_url}`);
      } else {
        alert("❌ Upload ล้มเหลว: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  return (
    <>
      <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 min-w-0">
            <img
              src={resolveImg(order.avatar) || "https://i.pravatar.cc/150"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-base truncate">
                {order.nickname || order.name || "ไม่ระบุชื่อ"}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {order.username || "@username"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <div className={`badge w-32 ${statusColors[order.status_name] || "badge-info"}`}>
              {order.status_name || ""}
            </div>
            <div className="text-red-600 font-bold text-xl mt-1">
              {order.post_service_fee || 0} ฿
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm space-y-1">
          <p><span className="font-semibold">สถานที่:</span> {order.kad_name || "-"}</p>
          <p><span className="font-semibold">ร้าน:</span> {order.store_name || "-"}</p>
          <p><span className="font-semibold">สินค้า:</span> {order.product || "-"}</p>
          <p><span className="font-semibold">ราคา:</span> {order.post_price ?? "-"} ฿</p>
          <p><span className="font-semibold">เวลาจัดส่ง:</span> {order.delivery_at || "-"}</p>
        </div>

        {order.proof_url && (
          <div className="mt-2">
            <p className="font-semibold text-sm">หลักฐานการชำระเงิน:</p>
            <img
              src={order.proof_url}
              alt="Proof"
              className="w-full max-h-48 object-contain rounded-lg mt-1 border"
            />
          </div>
        )}

        {(order.status_name === "Ordering" || order.status_name === "Rider Received") && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleSendClick}
              className="btn btn-primary text-white text-sm px-4 py-1"
              disabled={order.status_name === "Rider Received"} // ปิดปุ่มเมื่อ Rider Received
            >
              Send
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="btn btn-error text-white text-sm px-4 py-1"
              disabled={order.status_name === "Rider Received"} // ปิดปุ่มเมื่อ Rider Received
            >
              Cancel
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <dialog className="modal modal-open">
          <div className="modal-box p-6 rounded-lg shadow-xl bg-white text-black" style={{ maxWidth: "400px" }}>
            <h3 className="font-bold text-lg text-center mb-4">Cancel report</h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <select
                name="report"
                className="select select-bordered w-full text-black bg-white"
                value={reportForm.report}
                onChange={handleReportInputChange}
                required
              >
                <option disabled value="">Select a reason</option>
                {reportReasons
                  .filter((reason) => reason.id === 5) // <-- เฉพาะ id 5
                  .map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.title}
                    </option>
                  ))}
              </select>

              <input
                type="text"
                name="details"
                placeholder="รายละเอียดเพิ่มเติม"
                className="input input-bordered w-full text-black bg-white"
                autoComplete="off"
                value={reportForm.details}
                onChange={handleReportInputChange}
                required
              />

              {(reportForm.report === "2" || reportForm.report === "3" || reportForm.report === "4" || reportForm.report === "5") && (
                <div className="flex flex-col items-start gap-2">
                  <label htmlFor="reportImage" className="text-sm font-semibold text-gray-700">
                    Upload a picture (e.g., Proof )
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="reportImage"
                    className="file-input file-input-bordered w-full bg-white text-black"
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, image: e.target.files[0] }))
                    }
                  />
                </div>
              )}

              <div className="modal-action flex justify-center gap-3 mt-6">
                <button
                  type="button"
                  className="btn btn-ghost bg-red-500 text-white"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success text-black"
                  disabled={loadingCancel}
                >
                  {loadingCancel ? "กำลังส่ง..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

const OrderingList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/service/orders?status=Rider Received,Ordering`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId, newStatus, proofUrl, statusId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status_name: newStatus, proof_url: proofUrl, status_id: statusId || o.status_id }
          : o
      )
    );
  };

  const orderingCount = orders.length;

  const emptyText = useMemo(() => {
    if (loading) return "กำลังโหลดออเดอร์ของคุณ...";
    if (error) return `เกิดข้อผิดพลาด: ${error}`;
    return "You don't have any orders in progress.";
  }, [loading, error]);

  const handleNavigate = (page) => {
    window.location.href = `/service/${page}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar orderingCount={orderingCount} onNavigate={handleNavigate} />

      <div className="w-full px-4 pt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Orders in progress</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading &&
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
            ))}

          {!loading && orders.map((order) => (
            <OrderingCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}

          {!loading && orders.length === 0 && (
            <p className="text-gray-500 w-full text-left mt-10">{emptyText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderingList;
