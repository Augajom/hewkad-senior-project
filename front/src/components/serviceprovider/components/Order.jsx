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

const API_BASE = "https://hewkad.com:2053";

const resolveImg = (src) => {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
};

const FoodCard = ({ order, onRequestConfirm }) => {
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
                    : `https://hewkad.com:2053${order.avatar}`
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
  const navigate = useNavigate();
  const { user: rider, loading: loadingRider } = useAuth();

  const emptyText = useMemo(() => {
    if (loadingOrders) return "กำลังโหลดออเดอร์...";
    if (error) return `เกิดข้อผิดพลาด: ${error}`;
    return "ไม่มีออเดอร์เหลืออยู่";
  }, [loadingOrders, error]);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // FILTER: กรอง Orders ตาม Kad ที่เลือก
  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders];

    // Filter by Kad
    if (selectedKad && selectedKad.length > 0) {
      tempOrders = tempOrders.filter((order) =>
        selectedKad.includes(order.kad_name)
      );
    }

    // Dynamic search: เช็คทุก field ของ order
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

    return tempOrders;
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

    try {
      // 1️⃣ สร้างคำสั่งซื้อ (Step 1)
      const res1 = await fetch("https://hewkad.com:2053/service/hew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          post_id: selectedOrder.id,
          order_price: selectedOrder.price,
          order_service_fee: selectedOrder.service_fee,
          delivery_address: selectedOrder.delivery || selectedOrder.kad_name,
          delivery_time:
            dayjs().format("YYYY-MM-DD") + " " + selectedOrder.delivery_at,
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
          `https://hewkad.com:2053/service/orders/${newOrderId}/notification`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full px-4">
        {loadingOrders &&
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}

        {!loadingOrders &&
          filteredOrders.map((order) => (
            <FoodCard
              key={order.id}
              order={order}
              onRequestConfirm={() => handleRequestConfirm(order)}
            />
          ))}

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
