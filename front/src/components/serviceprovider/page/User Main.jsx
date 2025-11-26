import React, { useState } from "react";
import Navbar from "../components/navbar.jsx";
import OrderingList from "./orderingpage.jsx";
import HistoryPage from "./SP_History.jsx";
import Home from "./home.jsx";
import ChatPage from "../components/ChatPage.jsx";
import { useOrders } from "../hooks/useOrder"; // :white_check_mark: ดึง hook
import KadDropdown from "../components/Kaddropdown.jsx"; // :white_check_mark: นำ dropdown มาใช้
import "../DaisyUI.css";

function UserMain() {
  const [currentPage, setCurrentPage] = useState("home");
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // สถานที่ค้นหา

  // :white_check_mark: ดึงออเดอร์ Rider Received
  const { orders: riderOrders } = useOrders("Rider Received");
   const handleSearchSubmit = (value) => {
    setSearchQuery(value);
  };

  const handleKeyDown = (e) => {
  if (e.key === 'Enter' && onSearchSubmit) {
    onSearchSubmit(searchValue); // ส่งค่ากลับ UserMain
  }
};
  const orderingCount = riderOrders.length; // จำนวนออเดอร์ที่ยังดำเนินการอยู่

  // :small_blue_diamond: เมื่อกด HEW แล้วรับออเดอร์สำเร็จ
  const handleOrder = (order) => {
    console.log("Rider accepted order:", order);
  };

  // :white_check_mark: fetch kad options เมื่อโหลดหน้า
  React.useEffect(() => {
    const fetchKadOptions = async () => {
      try {
        const res = await fetch("https://hewkad.com:2052/customer/kad", {
          credentials: "include",
        });
        const data = await res.json();
        setKadOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch kad options failed:", err);
        setKadOptions([]);
      }
    };
    fetchKadOptions();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        orderingCount={orderingCount}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* :white_check_mark: Filter Kad สำหรับหน้า ordering */}
      {currentPage === "home" && (
        <div className="p-4">
          <div className="mb-4 w-60">
            <KadDropdown
              kadOptions={kadOptions}
              selectedKad={selectedKad}
              setSelectedKad={setSelectedKad}
            />
          </div>
          <Home
            onConfirmOrder={handleOrder}
            selectedKad={selectedKad}
            searchQuery={searchQuery}
          />
        </div>
      )}
      {currentPage === "ordering" && (
        <OrderingList selectedKad={selectedKad} />
      )}
      {currentPage === "history" && <HistoryPage />}
      {currentPage === "chat" && <ChatPage />}
    </div>

  );
}

export default UserMain;
