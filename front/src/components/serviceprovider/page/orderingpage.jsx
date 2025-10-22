import React, { useMemo } from "react";
import Navbar from "../components/navbar.jsx";
import { useOrders } from "../hooks/useOrder";
import "../DaisyUI.css";

const statusColors = {
  "Rider Received": "bg-blue-500 text-white",
  "Ordering": "bg-orange-500 text-white",
  "Order Received": "bg-green-500 text-white",
  "Reported": "bg-red-500 text-white",
};

const OrderingCard = ({ order, onSend }) => {
  return (
    <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={
              order.avatar
                ? `http://localhost:5000/uploads/${order.avatar}`
                : order.profileImg || "https://i.pravatar.cc/150"
            }
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-base">
              {order.nickname || order.name || "ไม่ระบุชื่อ"}
            </div>
            <div className="text-sm text-gray-500">
              {order.username || "@username"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`badge ${order.status_name === "Available" ? "badge-success" : "badge-info"
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

      {/* ปุ่ม Send */}
      {order.status_name === "Ordering" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onSend}
            className="btn btn-primary text-white text-sm px-4 py-1"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};


const OrderingList = () => {
  const { orders, loading, error } = useOrders("Rider Received,Ordering,Order Received,Reported");

  const orderingCount = orders.length;

  const emptyText = useMemo(() => {
    if (loading) return "กำลังโหลดออเดอร์ของคุณ...";
    if (error) return `เกิดข้อผิดพลาด: ${error}`;
    return "คุณยังไม่มีออเดอร์ที่กำลังดำเนินการ";
  }, [loading, error]);

  // ฟังก์ชันสำหรับ Navbar navigation
  const handleNavigate = (page) => {
    switch (page) {
      case "home":
        window.location.href = "/service/main";
        break;
      case "ordering":
        window.location.href = "/service/ordering";
        break;
      case "history":
        window.location.href = "/service/history";
        break;
      case "chat":
        window.location.href = "/service/chat";
        break;
      default:
        window.location.href = "/service/main";
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navbar */}
      <Navbar orderingCount={orderingCount} onNavigate={handleNavigate} />

      <div className="w-full px-4 pt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ออเดอร์ที่กำลังดำเนินการ</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
          ))}

          {!loading && orders.map(order => (
            <OrderingCard key={order.id} order={order} />
          ))}

          {!loading && orders.length === 0 && (
            <p className="text-gray-500 w-full text-left mt-10">{emptyText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderingList;
