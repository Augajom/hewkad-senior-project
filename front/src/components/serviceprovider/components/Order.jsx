// src/components/Order.jsx
import React, { useState, useMemo } from "react";
import ConfirmModal from "./ConfirmModal";
import { useOrders } from "../hooks/useOrder";
import dayjs from "dayjs";
import "../DaisyUI.css";

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
    <div className="group relative rounded-2xl border border-zinc-200/70 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <div className="font-semibold text-zinc-900 truncate">
                {order.nickname || order.name || "ไม่ระบุชื่อ"}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {order.username || "@username"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusTone}`}>
              {order.status_name || order.status || "-"}
            </span>
            <div className="rounded-xl bg-zinc-900 text-white px-2.5 py-1 text-sm font-semibold shadow-sm">
              ฿{order.service_fee || order.fee || 0}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">ตลาด</span>
            <span className="font-medium text-zinc-800">{order.kad_name || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">ร้าน</span>
            <span className="font-medium text-zinc-800 truncate">{order.store_name || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">สินค้า</span>
            <span className="font-medium text-zinc-800 truncate">{order.product || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">ราคา</span>
            <span className="font-semibold text-zinc-900">฿{order.price ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">ส่ง</span>
            <span className="text-zinc-800">{order.delivery || order.kad_name || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">เวลา</span>
            <span className="text-zinc-800">{order.delivery_at || "-"}</span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onRequestConfirm}
            className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white py-2.5 text-sm font-semibold shadow-sm hover:opacity-95 active:opacity-90 transition"
          >
            HEW
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 group-hover:ring-black/10 transition" />
    </div>
  );
};

const FoodCardList = ({ onConfirmOrder, status = "Available", selectedKad, searchQuery }) => {
  const { orders, loading, error, setOrders } = useOrders(status);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    let temp = Array.isArray(orders) ? orders : [];
    if (selectedKad && selectedKad.length > 0) {
      temp = temp.filter((o) => selectedKad.includes(o.kad_name));
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const rec = (v) => {
        if (v == null) return false;
        if (typeof v === "object") return Object.values(v).some(rec);
        return v.toString().toLowerCase().includes(q);
      };
      temp = temp.filter((o) => rec(o));
    }
    return temp;
  }, [orders, selectedKad, searchQuery]);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

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
      const data = await res1.json();
      const newOrderId = data.order_id;
      if (!newOrderId) throw new Error("Invalid order ID");
      await new Promise((r) => setTimeout(r, 150));
      try {
        const res2 = await fetch(`http://localhost:5000/service/orders/${newOrderId}/notification`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res2.ok) {
          await res2.text();
        }
      } catch {}
      const updated = { ...selectedOrder, status_name: "Rider Received" };
      onConfirmOrder(updated);
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
    } catch (e) {
      console.error(e);
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

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 p-10 text-center text-zinc-600">
            ไม่มีออเดอร์ในตลาดนี้
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <FoodCard
                key={order.id}
                order={order}
                onRequestConfirm={() => handleRequestConfirm(order)}
              />
            ))}
          </div>
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
