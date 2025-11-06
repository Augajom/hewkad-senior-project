// src/components/Order.jsx
import React, { useState, useMemo } from "react";
import ConfirmModal from "./ConfirmModal";
import { useOrders } from "../hooks/useOrder";
import dayjs from "dayjs";
import "../DaisyUI.css";

const API_BASE = "http://localhost:5000";

const resolveImg = (src) => {
  if (!src) return ""; // หรือ fallback เป็น default avatar ใน JSX
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
};

const FoodCard = ({ order, onRequestConfirm }) => {
  return (
    <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={
              order.avatar
                ? order.avatar.startsWith("http")
                  ? order.avatar
                  : `http://localhost:5000${order.avatar}`
                : "https://i.pravatar.cc/150"
            }
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-base">
              {order.nickname || order.name || "ไม่ระบุชื่อ"}
            </div>
            <div className="text-xs text-gray-500">
              {order.username || "@username"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={`badge ${
              order.status_name === "Available" ? "badge-success" : "badge-info"
            }`}
          >
            {order.status_name || order.status || ""}
          </div>
          <div className="text-red-600 font-bold text-xl mt-1">
            {order.service_fee || order.fee || 0} ฿
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="mt-4 text-sm space-y-1">
        <p>
          <span className="font-semibold">สถานที่:</span>{" "}
          {order.kad_name || order.location || "-"}
        </p>
        <p>
          <span className="font-semibold">ร้าน:</span>{" "}
          {order.store_name || order.shopName || "-"}
        </p>
        <p>
          <span className="font-semibold">สินค้า:</span>{" "}
          {order.product || order.item || "-"}
        </p>
        <p>
          <span className="font-semibold">ราคา:</span>{" "}
          {order.price ?? "-"} ฿
        </p>
        <p>
          <span className="font-semibold">ตลาด:</span>{" "}
          {order.kad_name || "-"}
        </p>
        <p>
          <span className="font-semibold">เวลาจัดส่ง:</span>{" "}
          {order.delivery_at || "-"}
        </p>
      </div>

      {/* ปุ่ม HEW */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onRequestConfirm}
          className="btn btn-error text-white text-sm px-4 py-1"
        >
          HEW
        </button>
      </div>
    </div>
  );
};


const FoodCardList = ({ onConfirmOrder, status = "Available", selectedKad, searchQuery }) => {
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
  // ✅ FILTER: กรอง Orders ตาม Kad ที่เลือก
  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders];

    // Filter by Kad
    if (selectedKad && selectedKad.length > 0) {
      tempOrders = tempOrders.filter(order => selectedKad.includes(order.kad_name));
    }

    // Dynamic search: เช็คทุก field ของ order
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();

      const matchesSearch = (obj) => {
        return Object.values(obj).some(value => {
          if (value == null) return false;
          // ถ้าเป็น object ให้ search recursive
          if (typeof value === "object") return matchesSearch(value);
          return value.toString().toLowerCase().includes(query);
        });
      };

      tempOrders = tempOrders.filter(order => matchesSearch(order));
    }

    return tempOrders;
  }, [orders, selectedKad, searchQuery]);

  const handleConfirm = async () => {
  if (!selectedOrder) return;

  try {
    // 1️⃣ สร้างคำสั่งซื้อ (Step 1)
    const res1 = await fetch("http://localhost:5000/service/hew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        post_id: selectedOrder.id,
        order_price: selectedOrder.price,
        order_service_fee: selectedOrder.service_fee,
        delivery_address: selectedOrder.delivery || selectedOrder.kad_name,
        delivery_time: dayjs().format("YYYY-MM-DD") + " " + selectedOrder.delivery_at,
      }),
    });

    if (!res1.ok) throw new Error(`Create order failed: HTTP ${res1.status}`);

    const orderData = await res1.json();
    const newOrderId = orderData.order_id;
    if (!newOrderId) throw new Error("Invalid order ID");

    console.log("Order created:", orderData);

    // เพิ่ม delay เล็กน้อยให้ DB commit เสร็จ
    await new Promise(resolve => setTimeout(resolve, 150));

    // 2️⃣ ส่งอีเมล + เปลี่ยน status ของโพสต์ (Step 2)
    try {
      const res2 = await fetch(`http://localhost:5000/service/orders/${newOrderId}/notification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res2.ok) {
        console.warn(`Notification request returned HTTP ${res2.status}`);
        const text = await res2.text();
        console.warn("Response:", text);
      } else {
        console.log("Notification sent successfully");
      }
    } catch (notifErr) {
      console.warn("Notification fetch failed:", notifErr);
    }

    // 3️⃣ อัปเดต UI
    const newOrder = { ...selectedOrder, status_name: "Rider Received" };
    onConfirmOrder(newOrder);
    setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));

  } catch (err) {
    console.error("Error creating order:", err);
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

        {!loading && filteredOrders.map(order => (
          <FoodCard
            key={order.id}
            order={order}
            onRequestConfirm={() => handleRequestConfirm(order)}
          />
        ))}

        {!loading && filteredOrders.length === 0 && (
          <p className="text-gray-500 w-full text-left mt-10">
            {error ? `เกิดข้อผิดพลาด: ${error}` : "ไม่มีออเดอร์ในตลาดนี้"}
          </p>
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
