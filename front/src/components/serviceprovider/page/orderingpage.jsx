import React, { useMemo, useRef, useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";
import { useOrders } from "../hooks/useOrder";
import "../DaisyUI.css";

const statusColors = {
  "Rider Received": "bg-blue-500 text-white",
  Ordering: "bg-orange-500 text-white",
  "Order Received": "bg-green-500 text-white",
  Reported: "bg-red-500 text-white",
};

const API_URL = "https://hewkad.com:8443";

const resolveImg = (src) => {
  if (!src) return ""; // หรือ fallback เป็น default avatar ใน JSX
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_URL}${path}`;
};

const OrderingCard = ({ order, onStatusUpdate }) => {
  const fileInputRef = useRef(null);

  const handleSendClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("proof", file);

    try {
      const res = await fetch(
        `${API_URL}/service/orders/${order.id}/upload-proof`,
        {
          method: "POST",
          body: formData,
          credentials: "include", // ส่ง cookie/JWT
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ แนบหลักฐานสำเร็จ!");
        console.log("Proof URL:", `${API_URL}${data.proof_url}`);

        // อัปเดต status + proof_url ใน parent state
        if (onStatusUpdate)
          onStatusUpdate(order.id, data.status, `${API_URL}${data.proof_url}`);
      } else {
        alert("❌ Upload ล้มเหลว: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  return (
    <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 min-w-0">
          <img
            src={
              order.avatar
                ? order.avatar.startsWith("http")
                  ? order.avatar
                  : `https://hewkad.com:8443${order.avatar}`
                : "https://i.pravatar.cc/150"
            }
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold text-base truncate">
              {order.nickname || order.name || "ไม่ระบุชื่อ"}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {order.username || "@username"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <div
            className={`badge w-32 ${
              statusColors[order.status_name] || "badge-info"
            }`}
          >
            {order.status_name || ""}
          </div>
          <div className="text-red-600 font-bold text-xl mt-1">
            {order.service_fee || 0} ฿
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="mt-4 text-sm space-y-1">
        <p>
          <span className="font-semibold">สถานที่:</span>{" "}
          {order.kad_name || "-"}
        </p>
        <p>
          <span className="font-semibold">ร้าน:</span> {order.store_name || "-"}
        </p>
        <p>
          <span className="font-semibold">สินค้า:</span> {order.product || "-"}
        </p>
        <p>
          <span className="font-semibold">ราคา:</span> {order.price ?? "-"} ฿
        </p>
        <p>
          <span className="font-semibold">เวลาจัดส่ง:</span>{" "}
          {order.delivery_at || "-"}
        </p>
      </div>

      {/* Proof Image */}
      {order.proof_url && (
        <div className="mt-2">
          <p className="font-semibold text-sm">หลักฐานการชำระเงิน:</p>
          <img
            src={order.proof_url}
            alt="Proof"
            className="w-full max-h-48 object-contain rounded-lg mt-1 border"
          />
        </div>
      )}

      {/* Upload Proof Button */}
      {order.status_name === "Ordering" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSendClick}
            className="btn btn-primary text-white text-sm px-4 py-1"
          >
            Send
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      )}
    </div>
  );
};

const OrderingList = () => {
  const {
    orders: ordersFromHook,
    loading,
    error,
  } = useOrders("Rider Received,Ordering,Order Received,Reported");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(ordersFromHook);
  }, [ordersFromHook]);

  const handleStatusUpdate = (orderId, newStatus, proofUrl) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status_name: newStatus, proof_url: proofUrl }
          : o
      )
    );
  };

  const orderingCount = orders.length;
  const emptyText = useMemo(() => {
    if (loading) return "กำลังโหลดออเดอร์ของคุณ...";
    if (error) return `เกิดข้อผิดพลาด: ${error}`;
    return "You don't have any orders in progress.";
  }, [loading, error]);

  const handleNavigate = (page) => {
    switch (page) {
      case "home":
        window.location.href = "/service/home";
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
        window.location.href = "/service/home";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar orderingCount={orderingCount} onNavigate={handleNavigate} />

      <div className="w-full px-4 pt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Orders in progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          {!loading &&
            orders.map((order) => (
              <OrderingCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
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
