import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "../DaisyUI.css";

const ConfirmModal = ({ visible, onCancel, onConfirm, selectedOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!visible) return null;

  const handleClickConfirm = async () => {
    if (isLoading) return; // ป้องกันกดซ้ำ
    setIsLoading(true);
    try {
      await onConfirm(); // เรียกฟังก์ชันส่ง backend
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="modal modal-open">
      <div className="modal-box bg-white text-black">
        <h3 className="font-bold text-lg text-black">ยืนยันการรับออเดอร์</h3>

        {selectedOrder && (
          <p className="py-4 text-black">
            คุณต้องการรับออเดอร์จาก{" "}
            <span className="font-semibold">{selectedOrder.name}</span> ใช่ไหม?
          </p>
        )}

        <div className="modal-action">
          <button
            className="btn btn-success text-white flex items-center gap-2"
            onClick={handleClickConfirm}
            
          >
            {isLoading ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin text-white text-lg" />
                กำลังดำเนินการ...
              </>
            ) : (
              "ยืนยัน"
            )}
          </button>
          <button
            className="btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
