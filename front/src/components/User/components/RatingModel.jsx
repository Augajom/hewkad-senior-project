// src/components/RatingModal.jsx
import React, { useState } from "react";
import axios from "axios";

export default function RatingModal({ orderId, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    if (rating < 1) return alert("กรุณาเลือกคะแนน");

    try {
      setLoading(true);
      await axios.post(
        "https://hewkad.com/customer/rate",
        { orderId, rating, comment },
        { withCredentials: true }
      );
      alert("ขอบคุณสำหรับการให้คะแนน!");
      onRated(rating);
      onClose();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกคะแนน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)", // โปร่ง 30%
        backdropFilter: "blur(4px)", // blur background
      }}
    >
      <div
        className="relative w-11/12 max-w-md p-6 rounded-2xl shadow-2xl"
        style={{ backgroundColor: "rgba(255,255,255,0.85)" }} // ขาวโปร่ง
      >
        {/* ปุ่มปิด */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        {/* หัวข้อ */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          ให้คะแนนออเดอร์
        </h2>

        {/* ดาวให้คะแนน */}
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <svg
              key={n}
              xmlns="http://www.w3.org/2000/svg"
              fill={n <= (hover || rating) ? "#FACC15" : "none"}
              viewBox="0 0 24 24"
              stroke="#FACC15"
              className="w-10 h-10 cursor-pointer transition-transform transform hover:scale-125 mx-1"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.113 6.48h6.828c.969 0 1.371 1.24.588 1.81l-5.522 3.996 2.113 6.48c.3.921-.755 1.688-1.538 1.118l-5.522-3.996-5.522 3.996c-.783.57-1.838-.197-1.538-1.118l2.113-6.48-5.522-3.996c-.783-.57-.38-1.81.588-1.81h6.828l2.113-6.48z"
              />
            </svg>
          ))}
        </div>

        {/* ช่องเขียนความคิดเห็น */}
        <textarea
          className="w-full border border-gray-300 rounded-xl p-3 resize-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-black-400 cursor-text"
          rows={4}
          placeholder="เขียนความคิดเห็น (ไม่บังคับ)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* ปุ่ม submit */}
        <button
          className="mt-5 w-full bg-yellow-400 bg-opacity-90 hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
          onClick={submitRating}
          disabled={loading}
        >
          {loading ? "กำลังบันทึก..." : "ส่งคะแนน"}
        </button>
      </div>
    </div>
  );
}
