import React, { useState } from "react";

import Navbar from "../components/navbar.jsx";
import FoodCardList from "../components/Order.jsx";
import SP_OrderStatus from "../components/SP_OrderStatus.jsx";
import HistoryPage from "./SP_History.jsx";
import ChatPage from "../components/ChatPage.jsx";
import "../DaisyUI.css";

function userMain() {
  const [currentPage, setCurrentPage] = useState("home");
  const [orderingList, setOrderingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // กด HEW → สร้าง order ใหม่ status เป็น Waiting
  const handleOrder = (order) => {
    setOrderingList((prev) => [
      ...prev,
      { ...order, status: "Waiting", proof: null },
    ]);
  };

  // Confirm Payment → เปลี่ยนจาก Waiting → Ordering
  const handleConfirmPayment = (orderId) => {
    setOrderingList((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "Ordering" } : order
      )
    );
  };

  // แนบหลักฐาน → เปลี่ยนเป็น Complete แล้วย้ายไป History
  const handleCompleteOrder = (orderId, file) => {
    const completedOrder = orderingList.find((order) => order.id === orderId);
    if (completedOrder) {
      const updatedOrder = {
        ...completedOrder,
        status: "Complete",
        proof: file,
      };

      setOrderingList((prev) => prev.filter((order) => order.id !== orderId));
      setHistoryList((prev) => [...prev, updatedOrder]);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        orderingCount={orderingList.length}
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
        {currentPage === "home" && (
          <FoodCardList onConfirmOrder={handleOrder} />
        )}

        {currentPage === "ordering" && (
          <SP_OrderStatus
            orderingList={orderingList}
            onConfirmPayment={handleConfirmPayment}
            onComplete={handleCompleteOrder}
          />
        )}

        {currentPage === "history" && <HistoryPage historyList={historyList} />}

        {currentPage === "chat" && (
          <ChatPage historyList={historyList} orderingList={orderingList} />
        )}
      </div>
    </div>
  );
}

export default userMain;
