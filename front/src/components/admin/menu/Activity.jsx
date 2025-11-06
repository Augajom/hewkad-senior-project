import React, { useState, useEffect } from "react";
import Nav from "../nav";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
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
            : "http://localhost:5000/admin/report";
        const { data } = await axios.get(url, { withCredentials: true });
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, [pageType]);

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

    // แปลงค่าต่างๆ เป็น string และ lowercase
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
    if (s.includes("reported")) return "text-red-600 font-semibold";
    if (s.includes("ordering")) return "text-orange-500 font-semibold";
    if (s.includes("rider received")) return "text-sky-500 font-semibold";
    if (s.includes("order received")) return "text-blue-600 font-semibold";

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
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">
            
            <div className="filter-con flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-8 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg">

              <div className="relative w-full sm:w-96">
                <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search by name, email, or order ID..."
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-6">
              <table className="w-full text-sm text-center text-slate-800">
                <thead className="bg-transparent text-slate-600 uppercase text-xs">
                  <tr className="border-b border-slate-300">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Rider (Service Provider)</th>
                    <th className="px-4 py-3">Order Status</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Service Fee</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Status Payment</th>
                    <th className="px-4 py-3">Slip File</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const fee = parseFloat(order.order_service_fee || 0);
                      const revenue = fee * 0.3; // ✅ Revenue 30%
                      const afterDeduct = fee - revenue; // ✅ Rider เหลือ 70%

                      return (
                        <tr
                          key={order.order_id}
                          className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50"
                        >
                          <td className="p-4">{order.order_id}</td>
                          <td className="p-4">{order.ordered_date}</td>
                          <td className ="p-4">
                            {order.customer_name || "-"}
                            <div className="text-slate-400 text-xs">
                              {order.customer_email || "-"}
                            </div>
                          </td>
                          <td className="p-4">
                            {order.rider_name || "-"}
                            <div className="text-slate-400 text-xs">
                              {order.rider_email || "-"}
                            </div>
                          </td>
                          <td
                            className={`p-4 ${getOrderStatusClass(
                              order.status_name
                            )}`}
                          >
                            {order.status_name || "-"}
                          </td>
                          <td className="p-4">{order.order_price || 0} ฿</td>
                          <td className="p-4">{fee.toFixed(2)} ฿</td>
                          <td className="p-4">
                            <div className="font-semibold text-green-700">
                              {revenue.toFixed(2)} ฿
                            </div>
                            <div className="text-xs text-slate-500">
                              Rider: {afterDeduct.toFixed(2)} ฿
                            </div>
                          </td>
                          <td
                            className={`p-4 ${getPaymentStatusClass(
                              order.status_payment
                            )}`}
                          >
                            {order.status_payment || "-"}
                          </td>
                          <td className="p-4">
                            {order.slip_filename ? (
                              <button
                                className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"
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
                      <td colSpan="10" className="text-slate-500 py-10">
                        ไม่มีข้อมูลในหน้านี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 max-w-xl w-full relative">
                  <button
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg text-red-500 text-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-all z-10"
                    onClick={closeModal}
                  >
                    <IoMdClose />
                  </button>
                  {selectedSlip && (
                    <img
                      src={selectedSlip}
                      alt="Slip"
                      className="max-h-[80vh] w-auto mx-auto rounded-lg"
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