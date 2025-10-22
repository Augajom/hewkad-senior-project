import React, { useState, useEffect } from 'react';
import '../DaisyUI.css';

const HistoryPostCard = ({ post }) => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReasons, setReportReasons] = useState([]);
    const [reportForm, setReportForm] = useState({ report: "", details: "" });
    const [status, setStatus] = useState(post.status);

    const total = (post.price || 0) + (post.service_fee || 0);

    // ดึงเหตุผลจาก backend
    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const res = await fetch("http://localhost:5000/customer/report-reasons", {
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
        if (status === 'Complete') return 'badge-success';
        if (status === 'Reported') return 'badge-error';
        return 'badge-neutral';
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/customer/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    post_id: post.id,
                    reason_id: reportForm.report,
                    detail: reportForm.details,
                }),
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
        <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <img
                        src={post.avatar ? `http://localhost:5000/uploads/${post.avatar}` : 'https://i.pravatar.cc/150'}
                        alt="avatar"
                        className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover"
                    />
                    <div>
                        <div className="font-bold text-base">{post.nickname || 'ไม่ระบุชื่อ'}</div>
                        <div className="text-sm text-gray-500">{post.username || '@username'}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className={`badge ${getBadgeClass(status)}`}>{status}</div>
                    <div className="text-red-600 font-bold text-xl mt-1">
                        {post.service_fee ? `${post.service_fee} ฿` : '0 ฿'}
                    </div>
                </div>
            </div>

            {/* ข้อมูลสินค้า */}
            <div className="mt-4 text-sm space-y-1">
                <p><span className="font-semibold">สถานที่ส่ง</span> : {post.deliveryLocation || '-'}</p>
                <p><span className="font-semibold">ชื่อร้าน</span> : {post.storeName || '-'}</p>
                <p><span className="font-semibold">หิ้ว</span> : {post.product || '-'}</p>
                <p><span className="font-semibold">ราคา</span> : {post.price ? `${post.price} บาท` : '-'}</p>
                <p><span className="font-semibold">ตลาด</span> : {post.kadName || '-'}</p>
                <p><span className="font-semibold">เวลาจัดส่ง</span> : {post.receivingTime || '-'}</p>
            </div>

            {/* Bottom */}
            <div className="mt-4 flex justify-between items-center gap-2">
                <div className="text-gray-800 text-xl font-bold">
                    <span className="font-semibold">Total :</span> {total} ฿
                </div>
                {/* ปุ่ม Report */}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        className="btn btn-error text-white"
                        onClick={() => setShowReportModal(true)}
                    >
                        Report
                    </button>
                </div>
            </div>


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
                            <select
                                name="report"
                                className="select select-bordered w-full text-black bg-white"
                                value={reportForm.report}
                                onChange={handleReportInputChange}
                                required
                            >
                                <option disabled value="">
                                    เลือกเหตุผล
                                </option>
                                {reportReasons.map((reason) => (
                                    <option key={reason.id} value={reason.id}>
                                        {reason.title}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="details"
                                placeholder="รายละเอียด"
                                className="input input-bordered w-full text-black bg-white"
                                value={reportForm.details}
                                onChange={handleReportInputChange}
                                required
                            />
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
        </div>
    );
};

export default HistoryPostCard;
