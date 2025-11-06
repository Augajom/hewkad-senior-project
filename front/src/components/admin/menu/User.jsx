import React, { useState } from "react";
import Nav from "../nav";
// SweetAlert2
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  showUserInfo,
  showUserLicense,
  showUserDelete,
  showAllowPermitUser,
  showDisablePermitUser,
  showConfirmVerify,
  showRejectVerify,
} from "./features/SweetAlertUser";
// Icon
import { CiSearch } from "react-icons/ci";

function User() {
  const MySwal = withReactContent(Swal);

  // toggle
  const [isOn, setIsOn] = useState(true);

  const [pageType, setPageType] = useState("User");

  const toggleSwitch = async () => {
    if (!isOn) {
      // กำลังจะ "เปิด"
      const result = await showAllowPermitUser();
      if (result.isConfirmed) {
        setIsOn(true);
        await MySwal.fire({
          title: '<span style="color:#333;">Permit Granted</span>',
          text: "The Permit Is Now Active.",
          icon: "success",
          confirmButtonColor: "#00c950",
          background: "#fff",
          customClass: {
            popup: "rounded-xl shadow-lg",
            container: "backdrop-blur",
          },
          backdrop: true,
        });
      }
    } else {
      // กำลังจะ "ปิด"
      const result = await showDisablePermitUser();
      if (result.isConfirmed) {
        setIsOn(false);
        await MySwal.fire({
          title: '<span style="color:#333;">Permit Revoked</span>',
          text: "The Permit Is Now Disable.",
          icon: "error",
          confirmButtonColor: "red",
          background: "#fff",
          customClass: {
            popup: "rounded-xl shadow-lg",
            container: "backdrop-blur",
          },
          backdrop: true,
        });
      }
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="filter-con flex gap-2">
              {/* Pages */}
              <div className="page-con relative w-full">
                <p className="absolute top-2 left-5 text-[#807a7a] text-sm">Page</p>
                <select
                  className="rounded px-4 pb-2 pt-7 w-full bg-white shadow-xl"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Request">Request</option>
                </select>
              </div>

              <div className="searh-con relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                />
                <CiSearch className="absolute size-6 right-4 top-[18px]" />
              </div>
            </div>

            {pageType === "User" ? (
              <>
                <div className="card-con flex flex-wrap justify-center gap-10 w-full max-w-7xl mx-auto">
                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="card set-center flex-col w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                    <div className="profile-con flex set-center">
                      <img
                        src="/src/assets/avatar.svg"
                        className="rounded-full"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">Name</p>
                        <p className="text-gray-500">@XXXXX</p>
                      </div>
                      <div className="permit-con">
                        <p className="font-semibold">Work-Permitted</p>
                        <div className="switch-con">
                          <div className="flex justify-end">
                            <div className="switch flex gap-1">
                              <span className="font-semibold text-lg"></span>

                              <label className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={isOn}
                                  onChange={toggleSwitch}
                                />
                                <span
                                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                    isOn ? "bg-green-500" : "bg-gray-800"
                                  }`}
                                ></span>
                                <span
                                  className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                    isOn ? "translate-x-6" : ""
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-con mt-4">
                      <button
                        onClick={showUserInfo}
                        className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                      >
                        Information
                      </button>
                      <button
                        onClick={showUserLicense}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                      >
                        License
                      </button>
                      <button
                        onClick={showUserDelete}
                        className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <table className="table-auto text-center my-6 mx-4 shadow-2xl border-separate border-spacing-x-0.5 border-spacing-y-1">
                  <thead>
                    <tr>
                      <th className="bg-gray-300 px-4 py-2">User ID</th>
                      <th className="bg-gray-300 px-13 py-2">Date</th>
                      <th className="bg-gray-300 px-4 py-2">Name</th>
                      <th className="bg-gray-300 px-4 py-2">Phone Number</th>
                      <th className="bg-gray-300 px-4 py-2">
                        Address
                      </th>
                      <th className="bg-gray-300 px-4 py-2">Bank</th>
                      <th className="bg-gray-300 px-4 py-2">Account Number</th>
                      <th className="bg-gray-300 px-4 py-2">Account Owner</th>
                      <th className="bg-gray-300 px-4 py-2">Identity File</th>
                      <th className="bg-gray-300 px-4 py-2">Verify</th>
                      <th className="bg-gray-300 px-4 py-2">Reject</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">@User2</td>
                      <td className="px-4 py-2">21 / 02 / 2025</td>
                      <td className="px-4 py-2">
                        Pongsakorn Srisawat
                      </td>
                      <td className="px-4 py-2">
                        0168888999
                      </td>
                      <td className="px-4 py-2">169/888 Sriracha</td>
                      <td className="px-4 py-2">SCB</td>
                      <td className="px-4 py-2">4581235446</td>
                      <td className="px-4 py-2">Pongsakorn Srisawat</td>
                      <td className="text-blue-600 underline decoration-2 px-4 py-2">
                        <a onClick={showUserLicense} className="cursor-pointer">IMG.PNG</a>
                      </td>
                      <td ><button onClick={showConfirmVerify} className="bg-green-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer">Confirm</button></td>
                      <td ><button onClick={showRejectVerify} className="bg-red-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer">Reject</button></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default User;
