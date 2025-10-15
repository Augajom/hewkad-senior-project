// src/components/Order.jsx
import React, { useState, useMemo } from "react";
import ConfirmModal from "./ConfirmModal";
import { useOrders } from "../hooks/useOrder";
import "../DaisyUI.css";


const FoodCard = ({ order, onRequestConfirm }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-black flex flex-col">
    <div className="flex items-center p-3 bg-gray-100">
      <img
        src={order.avatar || order.profileImg || "https://i.pravatar.cc/150"}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover mr-3"
      />
      <div>
        <div className="font-bold text-sm">{order.nickname || order.name || "ไม่ระบุชื่อ"}</div>
        <div className="text-xs text-gray-500">{order.username || "@username"}</div>
      </div>
    </div>

    <div className="p-3 text-sm space-y-1 flex-1">
      <p><span className="font-semibold">สถานที่:</span> {order.kad_name || order.location || "-"}</p>
      <p><span className="font-semibold">ร้าน:</span> {order.store_name || order.shopName || "-"}</p>
      <p><span className="font-semibold">สินค้า:</span> {order.product || order.item || "-"}</p>
      <p><span className="font-semibold">ราคา:</span> {order.price ?? "-"} ฿</p>
      <p><span className="font-semibold">ตลาด:</span> {order.kad_name || "-"}</p>
      <p><span className="font-semibold">เวลาจัดส่ง:</span> {order.delivery_at || "-"}</p>
    </div>

    <div className="flex justify-between items-center p-3 border-t border-gray-200">
      <span
        className={`text-xs text-white px-2 py-1 rounded ${
          order.status_name === "Available" ? "bg-green-500" : "bg-blue-400"
        }`}
      >
        {order.status_name || order.status || ""}
      </span>
      <div className="text-red-600 font-bold">{order.service_fee || order.fee || 0} ฿</div>
      <button
        onClick={onRequestConfirm}
        className="px-2 py-1 text-xs text-white bg-red-600 rounded"
      >
        HEW
      </button>
    </div>
  </div>
);

const FoodCardList = ({ onConfirmOrder, status = "Available" }) => {
  const { orders, loading, error, setOrders } = useOrders(status);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const emptyText = useMemo(() => {
    if (loading) return "กำลังโหลดออเดอร์...";
    if (error) return `เกิดข้อผิดพลาด: ${error}`;
    return "ไม่มีออเดอร์เหลืออยู่";
  }, [loading, error]);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };
  

  const handleConfirm = async () => {
    
    try {
      // เรียก backend เพื่ออัปเดตสถานะและส่งอีเมล
      const res = await fetch(`http://localhost:5000/service/orders/${selectedOrder.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // ไม่ต้องใส่ Authorization เพราะ token อยู่ใน cookie
      },
      credentials: 'include', // ส่ง cookies ไปด้วย
      body: JSON.stringify({})
    });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      console.log('Order updated:', result);

      // อัปเดต UI
      const newOrder = { ...selectedOrder, status_name: "Rider Received" };
      onConfirmOrder(newOrder);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    } catch (err) {
      console.error("Failed to confirm order:", err);
    } finally {
      setModalVisible(false);
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full px-4">
        {loading && [...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
        ))}

        {!loading && orders.map((order) => (
          <FoodCard
            key={order.id}
            order={order}
            onRequestConfirm={() => handleRequestConfirm(order)}
          />
        ))}

        {!loading && orders.length === 0 && (
          <p className="text-gray-500 w-full text-left mt-10">{emptyText}</p>
        )}
      </div>

      <ConfirmModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        selectedOrder={selectedOrder}
      />
    </>
  );
};

export default FoodCardList;
