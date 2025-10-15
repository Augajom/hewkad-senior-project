import React, { useState } from "react";
import Navbar from "../components/navbar.jsx";
import OrderingList from "./orderingpage.jsx";
import HistoryPage from "./SP_History.jsx";
import Home from "./home.jsx";
import ChatPage from "../components/ChatPage.jsx";
import { useOrders } from "../hooks/useOrder"; // ✅ ดึง hook
import "../DaisyUI.css";

function UserMain() {
  const [currentPage, setCurrentPage] = useState("home");

  // ✅ ดึงออเดอร์ Rider Received
  const { orders: riderOrders } = useOrders("Rider Received");
  const orderingCount = riderOrders.length; // จำนวนออเดอร์ที่ยังดำเนินการอยู่

  // 🔹 เมื่อกด HEW แล้วรับออเดอร์สำเร็จ
  const handleOrder = (order) => {
    console.log("Rider accepted order:", order);
     // ไปหน้าดูออเดอร์ที่รับแล้ว
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        orderingCount={orderingCount} // ✅ ส่งจำนวนจริง
      />

      {currentPage === "home" && (
        <div className="p-4 w-40">
          <select className="block w-full p-2 bg-gray-300 text-black rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">New Latest</option>
            <option value="#">#</option>
            <option value="#">#</option>
            <option value="#">#</option>
          </select>
        </div>
      )}

      <div className="p-4">
        {currentPage === "home" && <Home onConfirmOrder={handleOrder} />}
        {currentPage === "ordering" && <OrderingList />}
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "chat" && <ChatPage />}
      </div>
    </div>
  );
}

export default UserMain;
