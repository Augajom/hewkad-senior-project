import React, { useState, useEffect } from 'react';
import '../DaisyUI.css';

const HistoryPostCard = ({ post, className = "" }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [reportForm, setReportForm] = useState({ report: "", details: "", image: null });
  const [status, setStatus] = useState(post.status);
  const [showProofModal, setShowProofModal] = useState(false);
  const total = (post.price || 0) + (post.service_fee || 0);

  // โหลดเหตุผลจาก DB
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const res = await fetch("https://hewkad.com/customer/report-reasons", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load report reasons");
        const data = await res.json();
        setReportReasons(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReasons();
  }, []);

  const getBadgeClass = (status) => {
    if (status === 'Complete' || status === 'Successfully') return 'badge-success';
    if (status === 'Reported' || status === 'Reject') return 'badge-error';
    return 'badge-neutral';
  };

  // ส่ง report แบบมีไฟล์
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("post_id", post.id);
      formData.append("reason_id", reportForm.report);
      formData.append("detail", reportForm.details);
      if (reportForm.image) {
        formData.append("image", reportForm.image);
      }

      const res = await fetch("https://hewkad.com/customer/reports", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit report");
      }

      await res.json();
      setStatus("Reported");
      setShowReportModal(false);
      alert("Report submitted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Report error:", err);
      alert(err.message);
    }
  };

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`card w-full sm:w-[450px] md:w-[400px] lg:w-[450px] bg-white shadow-lg rounded-xl border border-gray-200 p-6 text-black ${className}`}>
      {/* Header - Responsive */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 min-w-0">
          <img
            src={post.avatar ? (post.avatar.startsWith("http") ? post.avatar : `https://hewkad.com${post.avatar}`) : 'https://i.pravatar.cc/150'}
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold text-base truncate">{post.nickname || 'ไม่ระบุชื่อ'}</div>
            <div className="text-sm text-gray-500 truncate">{post.username || '@username'}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className={`badge font-semibold text-white px-3 py-1 text-xs max-w-full truncate ${getBadgeClass(status)}`}>
            {status}
          </div>
          <div className="text-red-600 font-bold text-xl truncate max-w-full">
            {post.service_fee ? `${post.service_fee} ฿` : '0 ฿'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 text-sm space-y-1">
        <p><span className="font-semibold">สถานที่ส่ง</span> : {post.deliveryLocation || '-'}</p>
        <p><span className="font-semibold">ชื่อร้าน</span> : {post.store_name || '-'}</p>
        <p><span className="font-semibold">หิ้ว</span> : {post.product || '-'}</p>
        <p><span className="font-semibold">ราคา</span> : {post.price ? `${post.price} บาท` : '-'}</p>
        <p><span className="font-semibold">ตลาด</span> : {post.kadName || '-'}</p>
        <p><span className="font-semibold">เวลาจัดส่ง</span> : {post.receivingTime || '-'}</p>
      </div>

      {/* Bottom - Responsive */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-gray-800 text-xl font-bold">
          <span className="font-semibold">Total :</span> {total} ฿
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button 
            className="btn btn-error text-white w-full sm:w-auto" 
            onClick={() => setShowReportModal(true)}
          >
            Report
          </button>

          <button 
            className="btn btn-link text-blue-600 underline" 
            onClick={() => setShowProofModal(true)}
          >
            {status === 'Reported' ? "View Refund Proof" : "View Proof Of Delivery"}
          </button>
        </div>
      </div>

      {/* Proof Modal */}
      {showProofModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
            <h3 className="font-bold text-lg text-center mb-4">{status === 'Reported' ? "Refund Proof" : "Proof of Delivery"}</h3>
            <div className="flex justify-center mb-6">
              <img
                src={`https://hewkad.com${status === 'Reported' ? post.resolved_file : post.proof_url}`}
                alt="Proof"
                className="max-w-full max-h-[400px] object-contain rounded"
              />
            </div>
            <div className="flex justify-center">
              <button className="btn btn-error text-white px-8 py-3 rounded-full" onClick={() => setShowProofModal(false)}>
                ปิด
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <dialog className="modal modal-open">
          <div className="modal-box p-6 rounded-lg shadow-xl bg-white text-black" style={{ maxWidth: "400px" }}>
            <h3 className="font-bold text-lg text-center mb-4 text-black">Report Issue</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <select
                name="report"
                className="select select-bordered w-full text-black bg-white"
                value={reportForm.report}
                onChange={handleReportInputChange}
                required
              >
                <option disabled value="">Select a reason</option>
                {reportReasons.map((reason) => (
                  <option key={reason.id} value={reason.id}>{reason.title}</option>
                ))}
              </select>

              <input
                type="text"
                name="details"
                placeholder="details"
                className="input input-bordered w-full text-black bg-white"
                value={reportForm.details}
                autoComplete="off"
                onChange={handleReportInputChange}
                required
              />
              {reportForm.report === "1" && (
                  <p className="text-red-600 text-sm">
                    กรุณาอัปเดตโปรไฟล์ เบอร์โทรศัพท์ และบัญชีธนาคารของคุณก่อน
                  </p>
                )}

              {(reportForm.report === "2" || reportForm.report === "3" || reportForm.report === "4") && (
                <div className="flex flex-col items-start gap-2">
                  <label htmlFor="reportImage" className="text-sm font-semibold text-gray-700">อัพโหลดรูปภาพ</label>
                  <input
                    type="file"
                    accept="image/*"
                    id="reportImage"
                    className="file-input file-input-bordered w-full bg-white text-black"
                    onChange={(e) => setReportForm((prev) => ({ ...prev, image: e.target.files[0] }))}
                  />
                </div>
              )}

              <div className="modal-action flex justify-center gap-3 mt-6">
                <button type="button" className="btn btn-ghost bg-red-500 text-white" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success text-black">Submit</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default HistoryPostCard;