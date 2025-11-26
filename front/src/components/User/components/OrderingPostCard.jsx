// src/components/OrderingPostCard.jsx
import React, { useState, useEffect } from "react";
import RatingModal from "../components/RatingModel";
import Swal from "sweetalert2";
import "../DaisyUI.css";

const OrderingPostCard = ({ post }) => {
  const [status, setStatus] = useState(post.status);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [reportReasons, setReportReasons] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // skipok
  const [slipOkData, setSlipOkData] = useState([]);
  const [slipFile, setSlipFile] = useState("");
  const [slipError, setSlipError] = useState("");
  const proofImageUrl = post.proof_url || "/mnt/data/default-proof.png";

  const [reportForm, setReportForm] = useState({
    report: "",
    details: "",
  });

  // เปลี่ยนจาก .toFixed(2) → ใช้ Math.round() หรือ parseInt()
  const total = Math.round(
    parseFloat(post.price || 0) + parseFloat(post.service_fee || 0)
  );

  // โหลดเหตุผลจาก DB
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const res = await fetch(
          "https://hewkad.com/customer/report-reasons",
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to load report reasons");
        const data = await res.json();
        setReportReasons(data);
      } catch (err) {
        console.error("Fetch report reasons error:", err);
      }
    };
    fetchReasons();
  }, []);

  // slipok
  const handleFile = (e) => {
    setSlipFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile) return alert("กรุณาแนบไฟล์");

    const formData = new FormData();
    formData.append("files", slipFile);

    try {
      const res = await fetch("https://hewkad.com/customer/upload-slip", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to upload slip: ${res.status}`);
      }

      const data = await res.json();
      console.log("RES DATA:", data);
      setSlipOkData(data);

      // ตรวจสอบจำนวนเงิน
      if (parseFloat(data.data.amount) !== Number(total)) {
        setSlipError("จำนวนเงินไม่ถูกต้อง");
      } else if (data.success === false) {
        setSlipError("สลิปไม่ถูกต้อง");
      } else {
        setSlipError("");
        successAlert();
        setShowSlipModal(false);
      }
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error uploading slip:", error);
    }
  };

  // swal
  const successAlert = () => {
    Swal.fire({
      title: "ชำระเงินสำเร็จ",
      text: "ขอบคุณสำหรับการชำระเงิน",
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
    }).then(() => {
      handleConfirmPayment();
    });
  };

  // modal handlers
  const handleOpenSlipModal = () => {
    setShowQRModal(false);
    setShowSlipModal(true);
  };

  const handleOpenQR = async () => {
    try {
      const res = await fetch(
        `https://hewkad.com/customer/payment/qr/${post.id}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch error:", text);
        alert("ไม่สามารถสร้าง QR ได้");
        return;
      }

      const data = await res.json();
      setQrCode(data.qr);
      setShowQRModal(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const res = await fetch(
        `https://hewkad.com/customer/orders/${post.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Ordering" }),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to update order status");

      setStatus("Ordering");
      setShowQRModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

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

      const data = await res.json();
      console.log("Report success:", data);

      setStatus("Reported");
      setShowReportModal(false);
      alert("Report submitted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Report error:", err);
      alert(err.message);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const res = await fetch(
        `https://hewkad.com/customer/confirmorder/${post.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Complete" }),
        }
      );

      if (!res.ok) throw new Error("Failed to update order status");

      setStatus("Complete");
      alert("Order confirmed!");
      setShowRatingModal(true); // เปิดหน้าต่างให้ Rating
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card w-full sm:w-[450px] md:w-[400px] lg:w-[450px] bg-white shadow-lg rounded-xl border border-gray-200 p-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-start gap-4"> 
        <div className="flex gap-3 min-w-0">
          <img
            src={
              post.avatar
                ? post.avatar.startsWith("http")
                  ? post.avatar
                  : `https://hewkad.com${post.avatar}`
                : "https://i.pravatar.cc/150"
            }
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover flex-shrink-0"
          />
          
          <div className="min-w-0"> 
            <div className="font-bold text-base truncate">
              {post.nickname || "ไม่ระบุชื่อ"}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {post.username || "@username"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0"> 
          {status && (
            <div
              className={`badge font-semibold text-white px-3 py-1 text-xs max-w-full truncate ${
                status === "Ordering"
                  ? "badge-info"
                  : status === "Complete"
                  ? "badge-success"
                  : "badge-warning"
              }`}
            >
              {status}
            </div>
          )}
          <div className="text-red-600 font-bold text-xl truncate max-w-full">
            {post.service_fee ? `${post.service_fee} ฿` : "0 ฿"}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 text-sm space-y-1">
        <p>
          <span className="font-semibold">Delivery Location</span> :{" "}
          {post.deliveryLocation || "-"}
        </p>
        <p>
          <span className="font-semibold">Store Name</span> :{" "}
          {post.store_name || "-"}
        </p>
        <p>
          <span className="font-semibold">Product</span> : {post.product || "-"}
        </p>
        <p>
          <span className="font-semibold">Price</span> :{" "}
          {post.price ? `${post.price} บาท` : "-"}
        </p>
        <p>
          <span className="font-semibold">Kad Name</span> :{" "}
          {post.kadName || "-"}
        </p>
        <p>
          <span className="font-semibold">เวลาจัดส่ง</span> :{" "}
          {post.receivingTime || "-"}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-gray-800 text-xl font-bold">
          <span className="font-semibold">Total :</span> {total} ฿
        </div>

        {/* Action Buttons */}
        {status === "Rider Received" && (
          <button
            onClick={handleOpenQR}
            className="btn btn-info text-white w-full sm:w-auto"
          >
            Payment
          </button>
        )}
        {status === "Order Received" && (
          <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            {/* 1. Confirm/Report Button Row */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleConfirmOrder}
                className="btn btn-success text-white w-full sm:w-auto"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-error text-white w-full sm:w-auto"
              >
                Report
              </button>
            </div>

            {/* 2. View Proof Link */}
            <button
              className="btn btn-link text-blue-600 underline"
              onClick={() => setShowProofModal(true)}
            >
              View Proof Of Delivery
            </button>
          </div>
        )}
        {showProofModal && post.proof_url && (
          <dialog className="modal modal-open">
            <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
              <h3 className="font-bold text-lg text-center mb-4">Proof</h3>

              <div className="flex justify-center mb-6">
                <img
                  src={`https://hewkad.com${post.proof_url}`}
                  alt="Proof"
                  className="max-w-full max-h-[400px] object-contain rounded"
                />
              </div>

              <div className="flex justify-center">
                <button
                  className="btn btn-error text-white px-8 py-3 rounded-full"
                  onClick={() => setShowProofModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}

        {status === "Ordering" && (
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-error text-white w-full sm:w-auto"
          >
            Report
          </button>
        )}

        {/* --- MODALS (ไม่เปลี่ยนแปลง) --- */}

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-80 space-y-4 text-center shadow-xl">
              <h2 className="text-xl font-bold text-black">Scan to Pay</h2>
              {qrCode ? (
                <img src={qrCode} alt="PromptPay QR" className="mx-auto" />
              ) : (
                <p>กำลังโหลด...</p>
              )}
              <div>
                Total Amount:{" "}
                <span className="font-bold text-lg">{total} ฿</span>
              </div>
              <button
                onClick={handleOpenSlipModal}
                className="btn btn-success w-full mt-4"
              >
                Attach payment slip
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn btn-ghost w-full mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Slip Upload Modal */}
        {showSlipModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 space-y-4 text-center shadow-xl">
              <h2 className="text-xl font-bold text-black">
                Attach payment slip
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="file"
                  accept="image/*"
                  id="slipUpload"
                  onChange={handleFile}
                  className="hidden"
                />
                <label
                  htmlFor="slipUpload"
                  className="btn btn-outline btn-primary w-full cursor-pointer"
                >
                  Select file
                </label>
                {slipFile && (
                  <img
                    src={URL.createObjectURL(slipFile)}
                    alt="Slip Preview"
                    className="mx-auto mt-3 rounded-lg max-h-60 object-contain"
                  />
                )}
                {slipError && (
                  <p className="text-red-500 text-sm mt-2">{slipError}</p>
                )}
                <button className="btn btn-success w-full mt-4" type="submit">
                  Send a slip
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="btn btn-ghost w-full mt-2"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <dialog className="modal modal-open">
            <div
              className="modal-box p-6 rounded-lg shadow-xl bg-white text-black"
              style={{ maxWidth: "400px" }}
            >
              <h3 className="font-bold text-lg text-center mb-4 text-black">
                Report Issue
              </h3>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* เลือกเหตุผล */}
                <select
                  name="report"
                  className="select select-bordered w-full text-black bg-white"
                  value={reportForm.report}
                  onChange={handleReportInputChange}
                  required
                >
                  <option disabled value="">
                    Select a reason
                  </option>
                  {reportReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.title}
                    </option>
                  ))}
                </select>

                {/* รายละเอียด */}
                <input
                  type="text"
                  name="details"
                  placeholder="details"
                  className="input input-bordered w-full text-black bg-white"
                  autoComplete="off"
                  value={reportForm.details}
                  onChange={handleReportInputChange}
                  required
                />

                {/* เงื่อนไขตาม id */}
                {reportForm.report === "1" && (
                  <p className="text-red-600 text-sm">
                    Please update your profile, phone number and bank account first.
                  </p>
                )}

                {(reportForm.report === "2" ||
                  reportForm.report === "3" ||
                  reportForm.report === "4") && (
                  <div className="flex flex-col items-start gap-2">
                    <label
                      htmlFor="reportImage"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Upload a picture (of the wrong item)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="reportImage"
                      className="file-input file-input-bordered w-full bg-white text-black"
                      placeholder="ขอดูภาพของที่ผิดหน่อย"
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          image: e.target.files[0],
                        }))
                      }
                    />
                  </div>
                )}

                {/* ปุ่ม */}
                <div className="modal-action flex justify-center gap-3 mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost bg-red-500 text-white"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success text-black">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}

        {showRatingModal && (
          <RatingModal
            orderId={post.id}
            onClose={() => setShowRatingModal(false)}
            onRated={(rating) => {
              console.log("Rated:", rating);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderingPostCard;