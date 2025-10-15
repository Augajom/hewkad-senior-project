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

const OrderingCard = ({ order }) => {
  const statusClass = statusColors[order.status_name] || "bg-gray-500 text-white";

  return (
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
        <p><span className="font-semibold">สถานที่:</span> {order.kad_name || "-"}</p>
        <p><span className="font-semibold">ร้าน:</span> {order.store_name || "-"}</p>
        <p><span className="font-semibold">สินค้า:</span> {order.product || "-"}</p>
        <p><span className="font-semibold">ราคา:</span> {order.price ?? "-"} ฿</p>
        <p><span className="font-semibold">เวลาจัดส่ง:</span> {order.delivery_at || "-"}</p>
      </div>

      <div className="flex justify-between items-center p-3 border-t border-gray-200">
        <span className={`text-xs px-2 py-1 rounded ${statusClass}`}>
          {order.status_name || "Rider Received"}
        </span>
        <div className="text-red-600 font-bold">{order.service_fee || 0} ฿</div>
      </div>
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
