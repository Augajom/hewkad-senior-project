import React, { useState, useEffect } from "react";

import Navbar from "../components/navbar.jsx";
import FoodCardList from "../components/Order.jsx";
import SP_OrderStatus from "../components/SP_OrderStatus.jsx";
import HistoryPage from "./SP_History.jsx";
import ChatPage from "../components/ChatPage.jsx";
import "../DaisyUI.css";
import Kaddropdown from "../../User/components/Kaddropdown.jsx";
import OrderStatus from "../components/OrderStatus.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

function userMain() {
  const [currentPage, setCurrentPage] = useState("home");
  const [orderingList, setOrderingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState([]);
  const fetchKadOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/customer/kad', {
        credentials: 'include',
      });
      const data = await res.json();
      setKadOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch kad options failed:', err);
      setKadOptions([]);
    }
  };
  useEffect(() => {
    fetchKadOptions();
  }, []);



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
      <Kaddropdown
        kadOptions={kadOptions}
        selectedKad={selectedKad}
        setSelectedKad={setSelectedKad}
      />
      <div className="p-4">
        {currentPage === "home" && (
          <FoodCardList onConfirmOrder={handleOrder} filterKad={selectedKad} />
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
