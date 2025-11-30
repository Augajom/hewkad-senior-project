import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import dayjs from "dayjs";
import {
  showUserPayment,
  showRejectPayment,
} from "./features/SweetAlertPayment";
import Nav from "../Nav";

const API = import.meta.env?.VITE_API_URL || "https://hewkad.com/api";

const StatusChip = ({ text }) => {
  const map = {
    Pending: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    Completed: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    Rejected: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
    Default: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
  };
  const cls = map[text] || map.Default;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("https://hewkad.com/api/admin/payment", {
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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">
            <div className="relative w-full sm:w-96 mb-8">
              <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search Customer or Rider..."
                className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Card Grid */}
            <div className="card-con grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="card bg-white rounded-3xl shadow-2xl"
                  >
                    <div className="card-body p-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Order: {order.customer_username}
                      </h2>

                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-base font-medium text-slate-500">
                          Status:
                        </span>
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

                      <div className="details-con space-y-4 text-base mb-8">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Service Provider:
                          </p>
                          <p className="font-semibold text-slate-800">
                            {order.rider_username || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Amount:
                          </p>
                          <p className="font-semibold text-slate-800">
                            {order.order_price} Baht
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Fee:
                          </p>
                          <p className="font-semibold text-slate-800">
                            {order.order_service_fee} Baht
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Date:
                          </p>
                          <p className="font-semibold text-slate-800">
                            {new Date(order.ordered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white text-slate-700 shadow-md hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
