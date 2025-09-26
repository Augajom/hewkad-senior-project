// src/components/OrderingPostCard.jsx
import React, { useState } from 'react';
import '../DaisyUI.css';

const OrderingPostCard = ({ post }) => {
  const [status, setStatus] = useState(post.status);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const [reportForm, setReportForm] = useState({
    report: '',
    details: '',
  });

  const total = parseFloat(post.price || 0) + parseFloat(post.serviceFee || 0);

  const handleConfirmPayment = () => {
    setStatus('Ordering');
    setShowQRModal(false);
  };

  const handleConfirmOrder = async () => {
  try {
    const res = await fetch(`http://localhost:5000/customer/orders/${post.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Complete' }),
    });

    if (!res.ok) throw new Error('Failed to update order status');

    setStatus('Complete');
    alert('Order confirmed!');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
  
  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', reportForm);
    setShowReportModal(false);
  };

  return (
    <div className="card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={post.avatar || 'https://i.pravatar.cc/150'}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-base">{post.nickname || 'ไม่ระบุชื่อ'}</div>
            <div className="text-sm text-gray-500">{post.username || '@username'}</div>
          </div>
        </div>

        {/* Status and Service Fee */}
        <div className="flex flex-col items-end gap-2 max-w-full">
          {status && (
            <div
              className={`badge font-semibold text-white px-3 py-1 text-center whitespace-nowrap text-xs max-w-full truncate ${
                status === 'Ordering' ? 'badge-info' :
                status === 'Complete' ? 'badge-success' :
                'badge-warning'
              }`}
            >
              {status}
            </div>
          )}
          <div className="text-red-600 font-bold text-xl truncate max-w-full">
            {post.service_fee ? `${post.service_fee} ฿` : '0 ฿'}
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-4 text-sm space-y-1">
        <p><span className="font-semibold">Delivery Location</span> : {post.deliveryLocation || '-'}</p>
        <p><span className="font-semibold">Store Name</span> : {post.store_name || '-'}</p>
        <p><span className="font-semibold">Product</span> : {post.product || '-'}</p>
        <p><span className="font-semibold">Price</span> : {post.price ? `${post.price} บาท` : '-'}</p>
        <p><span className="font-semibold">Kad Name</span> : {post.kadName || '-'}</p>
        <p><span className="font-semibold">เวลาจัดส่ง</span> : {post.receivingTime || '-'}</p>
      </div>

      {/* Bottom buttons */}
      <div className="mt-4 flex justify-between items-center gap-2">
        <div className="text-gray-800 text-xl font-bold">
          <span className="font-semibold">Total :</span> {total} ฿
        </div>

        {/* Buttons */}
        {status === 'Rider Received' && (
          <button onClick={() => setShowQRModal(true)} className="btn btn-info text-white">
            Payment
          </button>
        )}

        {status === 'Order Received' && (
          <div className="flex gap-2">
            <button onClick={handleConfirmOrder} className="btn btn-success text-white">
              Confirm
            </button>
            <button onClick={() => setShowReportModal(true)} className="btn btn-error text-white">
              Report
            </button>
          </div>
        )}

        {status === 'Ordering' && (
          <button onClick={() => setShowReportModal(true)} className="btn btn-error text-white">
            Report
          </button>
        )}

        {/* QR Payment Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-80 space-y-4 text-center shadow-xl">
              <h2 className="text-xl font-bold text-black">Scan QR Code</h2>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=payto:${total}฿&size=200x200`}
                alt="QR Code"
                className="mx-auto"
              />
              <div>Total Amount: <span className="font-bold text-lg">{total} ฿</span></div>
              <button onClick={handleConfirmPayment} className="btn btn-success w-full mt-4">
                ยืนยันการชำระเงิน
              </button>
              <button onClick={() => setShowQRModal(false)} className="btn btn-ghost w-full mt-2">
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <dialog className="modal modal-open">
            <div className="modal-box p-6 rounded-lg shadow-xl bg-white text-black" style={{ maxWidth: '400px' }}>
              <h3 className="font-bold text-lg text-center mb-4 text-black">Report Issue</h3>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <select
                  name="report"
                  className="select select-bordered w-full text-black bg-white"
                  value={reportForm.report}
                  onChange={handleReportInputChange}
                  required
                >
                  <option disabled value="">Report</option>
                  <option>ส่งผิดที่</option>
                  <option>ส่งไม่ตรงเวลา</option>
                  <option>การกระทำไม่ดี</option>
                </select>
                <input
                  type="text"
                  name="details"
                  placeholder="details"
                  className="input input-bordered w-full text-black bg-white"
                  value={reportForm.details}
                  onChange={handleReportInputChange}
                  required
                />
                <div className="modal-action flex justify-center gap-3 mt-6">
                  <button type="button" className="btn btn-ghost bg-red-500 text-white" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success text-black">Submit</button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default OrderingPostCard;
