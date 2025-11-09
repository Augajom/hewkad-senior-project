// src/components/Order.jsx
import React, { useState, useMemo } from "react";
import ConfirmModal from "./ConfirmModal";
import { useOrders } from "../hooks/useOrder";
import dayjs from "dayjs";
import "../DaisyUI.css";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../hooks/useAuth";

const API_BASE = "http://localhost:5000";

const resolveImg = (src) => {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
};

const FoodCard = ({ order, onRequestConfirm }) => {
  const avatar =
    order.avatar
      ? `http://localhost:5000/uploads/${order.avatar}`
      : order.profileImg || "https://i.pravatar.cc/150";

  const statusTone =
    order.status_name === "Available"
      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
      : order.status_name === "Reserved" || order.status_name === "Ordering"
      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
      : order.status_name === "Complete"
      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
      : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200";

  return (
    <div className="relative bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 min-w-0">
            <img
              src={
                order.avatar
                  ? order.avatar.startsWith("http")
                    ? order.avatar
                    : `http://localhost:5000${order.avatar}`
                  : "https://i.pravatar.cc/150"
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {order.nickname || order.name || "ไม่ระบุชื่อ"}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {order.username || "@username"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status_name === "Available"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.status_name || order.status || ""}
            </span>
            <div className="text-red-600 font-bold text-xl mt-1">
              ฿{order.service_fee || order.fee || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Store</p>
            <p className="font-medium text-gray-900">
              {order.store_name || order.shopName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Market</p>
            <p className="font-medium text-gray-900">{order.kad_name || "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Product</p>
          <p className="font-medium text-gray-900">
            {order.product || order.item || "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-medium text-gray-900">฿{order.price ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivery Time</p>
            <p className="font-medium text-gray-900">
              {order.delivery_at || "-"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Delivery Location</p>
          <p className="font-medium text-gray-900">
            {order.delivery || order.kad_name || "-"}
          </p>
        </div>
      </div>

      {/* ปุ่ม HEW */}
      <div className="mt-2 mb-2 mr-2 flex justify-end">
        <button
          onClick={onRequestConfirm}
          className="btn btn-sm btn-error text-white"
        >
          HEW
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 group-hover:ring-black/10 transition" />
    </div>
  );
};

const FoodCardList = ({
  onConfirmOrder,
  status = "Available",
  selectedKad,
  searchQuery,
}) => {
  const {
    orders,
    loading: loadingOrders,
    error,
    setOrders,
  } = useOrders(status);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // FILTER: กรอง Orders ตาม Kad ที่เลือก
  const filteredOrders = useMemo(() => {
    let temp = Array.isArray(orders) ? orders : [];
    if (selectedKad && selectedKad.length > 0) {
      temp = temp.filter((o) => selectedKad.includes(o.kad_name));
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (obj) => {
        return Object.values(obj).some((value) => {
          if (value == null) return false;
          if (typeof value === "object") return matchesSearch(value);
          return value.toString().toLowerCase().includes(query);
        });
      };
      tempOrders = tempOrders.filter((order) => matchesSearch(order));
    }
    return temp;
  }, [orders, selectedKad, searchQuery]);

  const handleConfirm = async () => {
    if (!selectedOrder || !rider) {
      console.error("User (Rider) not found or order not selected.");
      return;
    }

    if (loadingRider) {
      console.log("Waiting for user auth...");
      return;
    }

    if (!rider || !selectedOrder) {
      console.error("User (Rider) not found or order not selected.");
      return;
    }

    const customer_id = selectedOrder.user_id;
    const rider_id = rider.id;
    const chatRoomId =
      customer_id < rider_id
        ? `${customer_id}_${rider_id}`
        : `${rider_id}_${customer_id}`;

    try {
      // สร้าง/อัปเดต ห้องแชทใน Firestore
      const chatRef = doc(db, "chats", chatRoomId);
      await setDoc(
        chatRef,
        {
          participants: [customer_id, rider_id],
          customer_id: customer_id,
          rider_id: rider_id,
          customer_name:
            selectedOrder.nickname || selectedOrder.name || "ลูกค้า",
          rider_name: rider.name || "ไรเดอร์",
          customer_avatar: selectedOrder.avatar || null,
          rider_avatar: rider.picture || null,
          lastTimestamp: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`Firebase Chat Room [${chatRoomId}] is ready.`);
    } catch (firebaseErr) {
      console.error("Error creating Firebase chat room:", firebaseErr);
    }

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    try {
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

      await new Promise((resolve) => setTimeout(resolve, 150));

      // 2️⃣ ส่งอีเมล + เปลี่ยน status ของโพสต์ (Step 2)
      try {
        const res2 = await fetch(
          `http://localhost:5000/service/orders/${newOrderId}/notification`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res2.ok) {
          await res2.text();
        }
      } catch {}
      const updated = { ...selectedOrder, status_name: "Rider Received" };
      onConfirmOrder(updated);
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      navigate(`/service/chat/${chatRoomId}`);
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setModalVisible(false);
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <div className="w-full px-4">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl border border-zinc-200/70 bg-white/80 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">
            เกิดข้อผิดพลาด: {error}
          </div>
        )}

        {!loadingOrders && filteredOrders.length === 0 && (
          <p className="text-gray-500 w-full text-left mt-10">
            {error
              ? `เกิดข้อผิดพลาด: ${error}`
              : "There are no orders in this market."}
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
