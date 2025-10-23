import { React, useState, useEffect } from "react";
import Nav from "../nav";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

// SweetAlert2
import {
  showUserSlip,
  showUserReportDetail,
  showResolvedDetail,
  confirmResolve,
} from "./features/SweetAlertUser";
// Icon

function Activity() {
  const [pageType, setPageType] = useState("History");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);

  // ดึงข้อมูล History (status_id = 7 หรือ 8)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/admin/payment/history",
          {
            withCredentials: true,
          }
        );

        console.log("Fetched orders:", data.orders);

        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // กรองตาม search input
  const filteredOrders = orders.filter(
    (order) =>
      order.customer_username.toLowerCase().includes(search.toLowerCase()) ||
      (order.rider_username &&
        order.rider_username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="filter-con flex gap-2">
              {/* Pages */}
              <div className="page-con relative w-full">
                <p className="absolute top-2 left-5 text-[#807a7a] text-sm">
                  Page
                </p>
                <select
                  className="rounded px-4 pb-2 pt-7 w-full bg-white shadow-xl"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                >
                  <option value="History">History</option>
                  <option value="Report">Report</option>
                </select>
              </div>

              <div className="search-con relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <CiSearch className="absolute size-6 right-4 top-[18px]" />
              </div>
            </div>

            <div className="text-con my-6">
              <table className="table-auto w-full text-center shadow-2xl border-separate border-spacing-x-0.5 border-spacing-y-1">
                <thead>
                  <tr>
                    {pageType === "History" ? (
                      <>
                        <th className="bg-gray-300 px-4 py-2">Order ID</th>
                        <th className="bg-gray-300 px-4 py-2">Date</th>
                        <th className="bg-gray-300 px-4 py-2">Customer</th>
                        <th className="bg-gray-300 px-4 py-2">
                          Service Provider
                        </th>
                        <th className="bg-gray-300 px-4 py-2">Order Status</th>
                        <th className="bg-gray-300 px-4 py-2">Amount</th>
                        <th className="bg-gray-300 px-4 py-2">Fee</th>
                        <th className="bg-gray-300 px-4 py-2">
                          Status Payment
                        </th>
                        <th className="bg-gray-300 px-4 py-2">Slip File</th>
                      </>
                    ) : (
                      // Report Head
                      <>
                        <th className="bg-gray-300 px-4 py-2">Order ID</th>
                        <th className="bg-gray-300 px-4 py-2">Date</th>
                        <th className="bg-gray-300 px-4 py-2">Reported By</th>
                        <th className="bg-gray-300 px-4 py-2">Reported User</th>
                        <th className="bg-gray-300 px-4 py-2">
                          Report Details
                        </th>
                        <th className="bg-gray-300 px-4 py-2">
                          Resolved Details
                        </th>
                        <th className="bg-gray-300 px-4 py-2">Status Report</th>
                        <th className="bg-gray-300 px-4 py-2">Resolve Issue</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pageType === "History" ? (
                    filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.order_id}>
                          <td className="px-4 py-2">{order.order_id}</td>
                          <td className="px-4 py-2">
                            {new Date(order.ordered_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            {order.customer_username}
                            <br />
                            (@{order.customer_username})
                          </td>
                          <td className="px-4 py-2">
                            {order.rider_username || "-"}
                            <br />
                            (@{order.rider_username || "-"})
                          </td>
                          <td className="text-green-600 px-4 py-2">
                            {order.status_name}
                          </td>
                          <td className="px-4 py-2">
                            {order.order_price} Baht
                          </td>
                          <td className="px-4 py-2">
                            {order.order_service_fee} Baht
                          </td>
                          <td
                            className={`px-4 py-2 font-semibold ${
                              order.status_payment === "reject"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {order.status_payment === "reject"
                              ? "Reject"
                              : "Completed"}
                          </td>
                          <td className="text-blue-600 underline decoration-2 px-4 py-2">
                            -
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-xl font-semibold py-4">
                          No orders found.
                        </td>
                      </tr>
                    )
                  ) : (
                    <>
                      {/* ข้อมูล Report */}
                      <tr>
                        <td className="px-4 py-2">3</td>
                        <td className="px-4 py-2">21 / 02 / 2025</td>
                        <td className="px-4 py-2">
                          Customer 3<br />
                          (@User3)
                        </td>
                        <td className="px-4 py-2">
                          Au
                          <br />
                          (@User5)
                        </td>
                        <td className="text-blue-600 underline decoration-2 px-4 py-2">
                          <a
                            onClick={showUserReportDetail}
                            className="cursor-pointer"
                          >
                            Details
                          </a>
                        </td>
                        <td className="text-blue-600 px-4 py-2">
                          <a href="">-</a>
                        </td>
                        <td className="text-red-600 px-4 py-2">Unresolved</td>
                        <td>
                          <button
                            onClick={confirmResolve}
                            className="bg-green-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer"
                          >
                            Confirm
                          </button>
                        </td>
                      </tr>

                      <tr>
                        <td className="px-4 py-2">1</td>
                        <td className="px-4 py-2">21 / 02 / 2025</td>
                        <td className="px-4 py-2">
                          Customer 3<br />
                          (@User3)
                        </td>
                        <td className="px-4 py-2">
                          Au
                          <br />
                          (@User5)
                        </td>
                        <td className="text-blue-600 underline decoration-2 px-4 py-2">
                          <a
                            onClick={showUserReportDetail}
                            className="cursor-pointer"
                          >
                            Details
                          </a>
                        </td>
                        <td className="text-blue-600 underline decoration-2 px-4 py-2">
                          <a
                            onClick={showResolvedDetail}
                            className="cursor-pointer"
                          >
                            Details
                          </a>
                        </td>
                        <td className="text-green-600 px-4 py-2">Resolved</td>
                        <td className="text-green-600 px-4 py-2">-</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Activity;
