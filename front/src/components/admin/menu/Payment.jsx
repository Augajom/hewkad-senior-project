import React from "react";
import Nav from "../nav";
// Icon
import { CiSearch } from "react-icons/ci";
// Sweetalert2
import {
  showUserPayment,
  showRejectPayment,
} from "./features/SweetAlertPayment";

function Payment() {
  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1]">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="searh-con relative">
              <input
                type="text"
                placeholder="Search here..."
                className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
              />
              <CiSearch className="absolute size-6 right-4 top-[18px]" />
            </div>

            <div className="card-con flex justify-center flex-wrap gap-10 w-full max-w-10xl mx-auto">
              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex items-center justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <div className="details-con set-center flex-col text-xl">
                  <div className="customer">
                    <b>Customer : </b>Au (@user1)
                  </div>
                  <div className="service-provider">
                    <b>Service Provider : </b>Oomsin (@Users02)
                  </div>
                  <div className="status">
                    <b>Status : </b>Completed
                  </div>
                  <div className="price">
                    <b>Amount : </b>200 Baht
                  </div>
                  <div className="fee">
                    <b>Fee : </b>50 Baht
                  </div>
                  <div className="date">
                    <b>Date : </b>21 / 02 / 2025
                  </div>
                </div>

                <div className="btn-con mt-4">
                  <div className="btn set-center gap-5">
                    <button
                      onClick={showRejectPayment}
                      className="text-xl text-white font-semibold px-5 p-2 w-full rounded-3xl bg-red-500 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={showUserPayment}
                      className="text-xl text-white font-semibold p-2 px-5 w-full rounded-3xl bg-[#34c759] cursor-pointer"
                    >
                      Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;
