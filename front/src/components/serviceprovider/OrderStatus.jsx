import React from "react";
import './DaisyUI.css'

const OrderStatus = ({
  profileImg,
  name,
  username,
  location,
  shopName,
  item,
  price,
  fee,
  status,
  onConfirmPayment,
  onSendProof,
}) => {
  const total = price + fee;

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-80 border border-blue-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img
            src={profileImg}
            alt={name}
            className="rounded-full w-12 h-12 object-cover"
          />
          <div>
            <div className="font-semibold text-black text-lg">{name}</div>
            <div className="text-sm text-gray-500">{username}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`text-xs font-semibold text-white px-3 py-1 rounded-full ${
              status === "Waiting"
                ? "bg-blue-500"
                : status === "Ordering"
                ? "bg-yellow-500"
                : "bg-gray-400"
            }`}
          >
            {status}
          </span>
          <span className="text-red-600 text-xl font-bold mt-2">{fee} ฿</span>
        </div>
      </div>

      <div className="mt-3 text-sm text-black space-y-1">
        <div>
          <strong>สถานที่:</strong> {location}
        </div>
        <div>
          <strong>ร้าน:</strong> {shopName}
        </div>
        <div>
          <strong>สินค้า:</strong> {item}
        </div>
        <div>
          <strong>ราคา:</strong> {price} บาท
        </div>
        <div>
          <strong>ค่าธรรมเนียม:</strong> {fee} บาท
        </div>
        <div className="font-bold text-blue-600">
          <strong>รวม:</strong> {total} บาท
        </div>
      </div>

      {status === "Waiting" && (
        <div className="mt-2 text-right">
          <button
            onClick={onConfirmPayment}
            className="text-xs text-green-600 hover:underline font-medium"
          >
            ✅ ยืนยันการชำระเงิน (Confirm Payment)
          </button>
        </div>
      )}

      {status === "Ordering" && (
        <div className="mt-2  text-right">
          <input
            type="file"
            onChange={(e) => onSendProof(e.target.files[0])}
            className="text-xs text-blue-600 hover:underline font-medium"
          />
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
