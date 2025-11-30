import React, { useState, useMemo } from "react";
import ConfirmModal from "./ConfirmModal";
import { useOrders } from "../hooks/useOrder";
import dayjs from "dayjs";
import "../DaisyUI.css";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../hooks/useAuth";

const API_BASE = "https://hewkad.com/api";

const FoodCard = ({ order, onRequestConfirm }) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/70 hover:shadow-xl transition-all duration-200 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                <img
                  src={
                    order.avatar
                      ? order.avatar.startsWith("http")
                        ? order.avatar
                        : `${API_BASE}${order.avatar}`
                      : "https://i.pravatar.cc/150"
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate">
                {order.nickname || order.name || "ไม่ระบุชื่อ"}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {order.username || "@username"}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                order.status_name === "Available"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.status_name || order.status || ""}
            </span>
            <div className="text-xs text-slate-500 text-right">
              <div className="text-[11px]">Service fee</div>
              <div className="text-lg font-bold text-rose-600">
                ฿{order.service_fee || order.fee || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Store</p>
            <p className="font-medium text-slate-900">
              {order.store_name || order.shopName || "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Market</p>
            <p className="font-medium text-slate-900">
              {order.kad_name || "-"}
            </p>
          </div>
        </div>

        <div className="text-xs">
          <p className="text-slate-500">Product</p>
          <p className="font-medium text-slate-900">
            {order.product || order.item || "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Price</p>
            <p className="font-medium text-slate-900">
              ฿{order.price ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Delivery Time</p>
            <p className="font-medium text-slate-900">
              {order.delivery_at || "-"}
            </p>
          </div>
        </div>

        <div className="text-xs">
          <p className="text-slate-500">Delivery Location</p>
          <p className="font-medium text-slate-900">
            {order.delivery || order.kad_name || "-"}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 flex justify-end">
        <button
          onClick={onRequestConfirm}
          className="btn btn-sm rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white border-none px-4 shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all"
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
    return "There are no orders available in this market.";
  }, [loadingOrders, error]);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders];

    if (selectedKad && selectedKad.length > 0) {
      tempOrders = tempOrders.filter((order) =>
        selectedKad.includes(order.kad_name)
      );
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (obj) =>
        Object.values(obj).some((value) => {
          if (value == null) return false;
          if (typeof value === "object") return matchesSearch(value);
          return value.toString().toLowerCase().includes(query);
        });
      tempOrders = tempOrders.filter((order) => matchesSearch(order));
    }

    return tempOrders;
  }, [orders, selectedKad, searchQuery]);

  const handleConfirm = async () => {
    if (!selectedOrder || !rider || loadingRider) return;

    const customer_id = selectedOrder.user_id;
    const rider_id = rider.id;
    const chatRoomId =
      customer_id < rider_id
        ? `${customer_id}_${rider_id}`
        : `${rider_id}_${customer_id}`;

    try {
      const chatRef = doc(db, "chats", chatRoomId);
      await setDoc(
        chatRef,
        {
          participants: [customer_id, rider_id],
          customer_id,
          rider_id,
          customer_name:
            selectedOrder.nickname || selectedOrder.name || "ลูกค้า",
          rider_name: rider.name || "ไรเดอร์",
          customer_avatar: selectedOrder.avatar || null,
          rider_avatar: rider.picture || null,
          lastTimestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (firebaseErr) {
      console.error("Error creating Firebase chat room:", firebaseErr);
    }

    try {
      const res1 = await fetch(`${API_BASE}/service/hew`, {
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

      await new Promise((resolve) => setTimeout(resolve, 150));

      try {
        const res2 = await fetch(
          `${API_BASE}/service/orders/${newOrderId}/notification`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res2.ok) {
          const text = await res2.text();
          console.warn(
            `Notification request returned HTTP ${res2.status}`,
            text
          );
        }
      } catch (notifErr) {
        console.warn("Notification fetch failed:", notifErr);
      }

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
      <div className="w-full px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Available Orders
            </h2>
            <p className="text-xs text-slate-500">
              Choose an order to start delivering
            </p>
          </div>
          {filteredOrders.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700 font-medium">
              {filteredOrders.length} orders
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {loadingOrders &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-52 bg-slate-100 animate-pulse rounded-2xl"
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
            <p className="text-slate-400 text-sm mt-6">{emptyText}</p>
          )}
        </div>
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
