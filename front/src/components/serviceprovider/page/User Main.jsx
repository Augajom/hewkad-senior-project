import React, { useState, useEffect } from "react";


import Navbar from "../components/navbar.jsx";
import OrderingList from "./orderingpage.jsx";
import HistoryPage from "./SP_History.jsx";
import Home from "./home.jsx";
import ChatPage from "../components/ChatPage.jsx";
import { useOrders } from "../hooks/useOrder"; // ✅ ดึง hook
import "../DaisyUI.css";
import Kaddropdown from "../../User/components/Kaddropdown.jsx";
import OrderStatus from "../components/OrderStatus.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

function UserMain() {
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
        {currentPage === "home" && <Home onConfirmOrder={handleOrder} />}
        {currentPage === "ordering" && <OrderingList />}
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "chat" && <ChatPage />}
      </div>
    </div>
  );
}

export default UserMain;
