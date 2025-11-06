import React, { useEffect, useState } from "react";
import Nav from "../nav";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import {
  showUserPayment,
  showRejectPayment,
} from "./features/SweetAlertPayment";

function Payment() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/payment", {
          withCredentials: true,
        });
        console.log(res.data.orders);
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // กรองข้อมูลตาม search input
  const filteredOrders = orders.filter(
    (order) =>
      order.customer_username.toLowerCase().includes(search.toLowerCase()) ||
      (order.rider_username &&
        order.rider_username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Nav />
      {/* 1. พื้นหลัง Gradient (เหมือนเดิม) */}
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">
            
            {/* 2. Search Bar (สไตล์เดิม) */}
            <div className="relative w-full sm:w-96 mb-8">
              <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search Customer or Rider..."
                className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* 3. Card Grid */}
            <div className="card-con grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    // 🎨 4. เปลี่ยน Card เป็นสไตล์ "Solid White" ตามรูป
                    className="card bg-white rounded-3xl shadow-2xl" 
                  >
                    <div className="card-body p-8">
                      
                      {/* 🎨 5. Title (ตัวหนา สีเข้ม) */}
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Order: {order.customer_username}
                      </h2>

                      {/* 🎨 6. Status Badge (แบบ Pill) */}
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-base font-medium text-slate-500">Status:</span>
                        <span
                          className={`badge badge-md text-white font-semibold border-none rounded-full px-4 py-3 ${
                            order.status_name === "Completed"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600" // "Complete" ในรูปเป็นสีน้ำเงิน
                              : "bg-gradient-to-r from-orange-500 to-yellow-500" // สไตล์สำรอง
                          }`}
                        >
                          {order.status_name}
                        </span>
                      </div>

                      {/* 🎨 7. Details (จัด Layout ใหม่ตามรูป) */}
                      <div className="details-con space-y-4 text-base mb-8">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Service Provider:</p>
                          <p className="font-semibold text-slate-800">{order.rider_username || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Amount:</p>
                          <p className="font-semibold text-slate-800">{order.order_price} Baht</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Fee:</p>
                          <p className="font-semibold text-slate-800">{order.order_service_fee} Baht</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Date:</p>
                          <p className="font-semibold text-slate-800">{new Date(order.ordered_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* 🎨 8. Solid Gradient Buttons (ตามรูป) */}
                      <div className="btn-con w-full space-y-3">
                        <button
                          onClick={() => showUserPayment(order, order.order_id)}
                          className="btn btn-block h-12 border-none text-white font-bold text-base shadow-lg 
                                     bg-gradient-to-r from-green-400 to-teal-500 
                                     hover:from-green-500 hover:to-teal-600"
                        >
                          Payment
                        </button>
                        <button
                          onClick={() => showRejectPayment(order)}
                          className="btn btn-block h-12 border-none text-white font-bold text-base shadow-lg 
                                     bg-gradient-to-r from-red-500 to-pink-500 
                                     hover:from-red-600 hover:to-pink-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                  No orders found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;