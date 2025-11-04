import React, { useState, useEffect } from "react";
import Nav from "../nav";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

function Activity() {
  const [pageType, setPageType] = useState("History");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // ดึงข้อมูลตามหน้า (History / Report)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url =
          pageType === "History"
            ? "http://localhost:5000/admin/history"
            : "http://localhost:5000/admin/report"; // ✅ endpoint report
        const { data } = await axios.get(url, { withCredentials: true });
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, [pageType]); // ✅ ดึงใหม่เมื่อเปลี่ยนหน้า

  // ฟังก์ชันเปิด/ปิด modal
  const openSlipModal = (url) => {
    setSelectedSlip(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSlip(null);
  };

  // Filter ตาม search
  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();

    // แปลงค่าต่างๆ เป็น string และ lowercase ก่อนตรวจ
    return (
      order.order_id?.toString().toLowerCase().includes(query) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_username?.toLowerCase().includes(query) ||
      order.customer_email?.toLowerCase().includes(query) ||
      order.rider_name?.toLowerCase().includes(query) ||
      order.rider_username?.toLowerCase().includes(query) ||
      order.rider_email?.toLowerCase().includes(query) ||
      order.status_name?.toLowerCase().includes(query) ||
      order.status_payment?.toLowerCase().includes(query) ||
      order.order_price?.toString().toLowerCase().includes(query) ||
      order.order_service_fee?.toString().toLowerCase().includes(query) ||
      order.slip_filename?.toLowerCase().includes(query)
    );
  });
  // สี status
  const getOrderStatusClass = (status) => {
    if (!status) return "text-gray-600";
    const s = status.toLowerCase();

    if (s.includes("complete") || s.includes("successfully"))
      return "text-green-600 font-semibold"; // ✅ เขียว
    if (s.includes("reported")) return "text-red-600 font-semibold"; // 🔴 แดง
    if (s.includes("ordering")) return "text-orange-500 font-semibold"; // 🟠 ส้ม
    if (s.includes("rider received")) return "text-sky-500 font-semibold"; // 🔵 ฟ้า
    if (s.includes("order received")) return "text-blue-600 font-semibold"; // 🔷 น้ำเงิน

    return "text-gray-600";
  };

  // สีสถานะ payment
  const getPaymentStatusClass = (status) => {
    if (!status) return "text-gray-500";
    const s = status.toLowerCase();
    if (s === "completed") return "text-green-600 font-semibold";
    if (s === "reject") return "text-red-600 font-semibold";
    return "text-gray-500";
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            {/* Filter */}
            <h1 className="text-3xl font-bold mb-6 text-center">History</h1>

            {/* Search */}
            <div className="search-con relative mb-6 flex justify-end">
              <input
                type="text"
                placeholder="Search by name or order ID..."
                className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="absolute size-6 right-4 top-[18px]" />
            </div>

            {/* ตาราง History / Report */}
            <div className="overflow-x-auto bg-white shadow-2xl rounded-lg p-6">
              <table className="w-full text-sm text-center text-black">
                <thead className="bg-gray-200 text-black uppercase text-sm">
                  <tr className="border-b">
                    <th className="px-10 py-3">Order ID</th>
                    <th className="px-10 py-3">Date</th>
                    <th className="px-10 py-3">Customer</th>
                    <th className="px-10 py-3">Rider (Service Provider)</th>
                    <th className="px-10 py-3">Order Status</th>
                    <th className="px-10 py-3">Price</th>
                    <th className="px-10 py-3">Service Fee</th>
                    <th className="px-10 py-3">Revenue</th>
                    <th className="px-10 py-3">Status Payment</th>
                    <th className="px-10 py-3">Slip File</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const fee = parseFloat(order.order_service_fee || 0);
                      const revenue = fee * 0.3; // ✅ Revenue 30%
                      const afterDeduct = fee - revenue; // ✅ Rider เหลือ 70%

                      return (
                        <tr key={order.order_id} className="border-b">
                          <td>{order.order_id}</td>
                          <td>{order.ordered_date}</td>
                          <td>
                            {order.customer_name || "-"}
                            <div className="text-gray-400 text-xs">
                              {order.customer_email || "-"}
                            </div>
                          </td>
                          <td>
                            {order.rider_name || "-"}
                            <div className="text-gray-400 text-xs">
                              {order.rider_email || "-"}
                            </div>
                          </td>
                          <td className={getOrderStatusClass(order.status_name)}>
                            {order.status_name || "-"}
                          </td>
                          <td>{order.order_price || 0} ฿</td>
                          <td>{fee.toFixed(2)} ฿</td>
                          <td>
                            <div className="font-semibold text-green-700">
                              {revenue.toFixed(2)} ฿
                            </div>
                            <div className="text-xs text-gray-500">
                              หลังหักให้ Rider {afterDeduct.toFixed(2)} ฿
                            </div>
                          </td>
                          <td className={getPaymentStatusClass(order.status_payment)}>
                            {order.status_payment || "-"}
                          </td>
                          <td>
                            {order.slip_filename ? (
                              <button
                                className="text-blue-600 underline decoration-2 px-2 py-1 cursor-pointer"
                                onClick={() =>
                                  openSlipModal(
                                    `http://localhost:5000/Files/Payment/${order.slip_filename}`
                                  )
                                }
                              >
                                View Slip
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-gray-500 py-10">
                        ไม่มีข้อมูลในหน้านี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Popup */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg max-w-xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-red-500 font-bold text-xl"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                  {selectedSlip && (
                    <img
                      src={selectedSlip}
                      alt="Slip"
                      className="max-h-[80vh] w-auto mx-auto"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Activity;
