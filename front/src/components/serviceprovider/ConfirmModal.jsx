import React from "react";
import { createPortal } from "react-dom";
import './DaisyUI.css'

const ConfirmModal = ({ visible, onCancel, onConfirm, selectedOrder }) => {
  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-s">
      <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
        <p className="text-lg text-black font-bold mb-4">ยืนยันการรับออเดอร์</p>
        {selectedOrder && (
          <p className="mb-4 text-black">
            คุณต้องการรับออเดอร์จาก{" "}
            <span className="font-bold text-black ">{selectedOrder.name}</span> ใช่ไหม?
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
