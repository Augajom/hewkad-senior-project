import React, { useState } from 'react';
import proofImage from '../../../assets/proof.jpg';
import '../DaisyUI.css'

const HistoryPostCard = ({ post }) => {
    const [showProofModal, setShowProofModal] = useState(false);
    const total = (post.price || 0) + (post.service_fee || 0);

    // ตัวอย่างลิงก์ภาพหลักฐาน (แก้เป็นจริงตามของคุณ)
    const proofImageUrl = post.proofImageUrl || "/mnt/data/79ba7201-e945-40c2-a787-64cb098fdb86.png";
    const getBadgeClass = (status) => {
        if (status === 'Complete') return 'badge-success';
        if (status === 'Reported') return 'badge-error';
        return 'badge-neutral';
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
                    <div className={`badge ${getBadgeClass(post.status)}`}>
                        {post.status}
                    </div>

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
            <div className="mt-4 flex justify-between items-center">
                <div className="text-gray-800 text-xl font-bold">
                    <span className="font-semibold">Total :</span> {total} ฿
                </div>

                {/* ปุ่ม View Proof */}
                <div className="mt-4 flex justify-end">
                    <button
                        className="btn btn-link text-blue-600 underline"
                        onClick={() => setShowProofModal(true)}
                    >
                        View Proof Of Delivery
                    </button>
                </div>
            </div>


            {showProofModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
                        <h3 className="font-bold text-lg text-center mb-4">Proof</h3>

                        <div className="flex justify-center mb-6">
                            <img src={proofImage} alt="Proof" className="max-w-full max-h-80 object-contain" />
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white"
                                onClick={() => setShowProofModal(false)}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default HistoryPostCard;
