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
        withCredentials: true, // ต้องมีอันนี้
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };
  fetchOrders();
}, []);


  // กรองข้อมูลตาม search input
  const filteredOrders = orders.filter((order) =>
    order.customer_username.toLowerCase().includes(search.toLowerCase()) ||
    (order.rider_username && order.rider_username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="search-con relative mb-5">
              <input
                type="text"
                placeholder="Search here..."
                className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="absolute size-6 right-4 top-[18px]" />
            </div>

            <div className="card-con flex justify-center flex-wrap gap-10 w-full max-w-10xl mx-auto">
              {filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl"
                >
                  <div className="details-con set-center flex-col text-xl">
                    <div className="customer">
                      <b>Customer : </b> {order.customer_username}
                    </div>
                    <div className="service-provider">
                      <b>Service Provider : </b>{" "}
                      {order.rider_username || "-"}
                    </div>
                    <div>
                      <b>Status : </b> {order.status_name}
                    </div>
                    <div className="price">
                      <b>Amount : </b> {order.order_price} Baht
                    </div>
                    <div className="fee">
                      <b>Fee : </b> {order.order_service_fee} Baht
                    </div>
                    <div className="date">
                      <b>Date : </b>{" "}
                      {new Date(order.ordered_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="btn-con mt-4 w-full">
                    <div className="set-center gap-5 flex flex-col md:flex-row">
                      <button
                        onClick={() => showRejectPayment(order)}
                        className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => showUserPayment(order.order_id)}
                        className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                      >
                        Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-xl font-semibold mt-10">
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
