import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Nav";
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
import { CiSearch } from "react-icons/ci";
import AdminLayout from "../AdminLayout";
import avatar from "../../../assets/avatar.svg"

function UserCard({ user, permitted, onTogglePermit }) {
  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-[#171a1f] border border-gray-800 shadow-lg w-[320px]">
      <div className="flex items-center gap-3 w-full">
        <img src={avatar} className="rounded-full w-16 h-16" />
        <div className="min-w-0">
          <p className="font-semibold truncate text-gray-100">{user.name}</p>
          <p className="text-gray-400 truncate">@{user.handle}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-medium text-xs text-gray-300">Work-Permitted</p>
          <label className="relative inline-block w-12 h-6 mt-1">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={permitted}
              onChange={() => onTogglePermit(user)}
            />
            <span
              className={`absolute inset-0 rounded-full transition ${
                permitted ? "bg-emerald-500" : "bg-gray-700"
              }`}
            />
            <span
              className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition ${
                permitted ? "translate-x-6" : ""
              }`}
            />
          </label>
        </div>
      </div>

      <div className="w-full mt-5 grid grid-cols-1 gap-2">
        <button
          onClick={() => showUserInfo(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500"
        >
          Information
        </button>
        <button
          onClick={() => showUserLicense(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-amber-500 hover:bg-amber-400"
        >
          License
        </button>
        <button
          onClick={() => showUserDelete(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-rose-600 hover:bg-rose-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const MySwal = withReactContent(Swal);
  const [pageType, setPageType] = useState("User");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [request, setRequest] = useState([]);

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const resolveImg = (imgPath) => {
    if (!imgPath) return "/src/assets/avatar.svg";
    if (imgPath.startsWith("http")) return imgPath;
    return `https://hewkad.com/api${imgPath}`;
  };

  useEffect(() => {
    fetchUsers();
    fetchRequest();
  }, []);

  // --- All fetch functions and handlers (handleDeleteUser, handleTogglePermit, etc.) ---
  // --- remain unchanged as their logic is correct. ---
  // (Lógic functions like fetchUsers, fetchRequest, handleTogglePermit, handleDeleteUser are kept the same)

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://hewkad.com/api/admin/users", {
        withCredentials: true,
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      MySwal.fire("Error", "Failed to fetch users", "error");
    }
  };

  const fetchRequest = async () => {
    try {
      const res = await axios.get("https://hewkad.com/api/admin/users/request", {
        withCredentials: true,
      });
      setRequest(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      MySwal.fire("Error", "Failed to fetch users", "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    const userName = user?.name || "";
    const email = user?.email || "";
    return (
      userName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ✅ pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePermit = async (userId, currentStatus) => {
    try {
      const result = currentStatus
        ? await showDisablePermitUser()
        : await showAllowPermitUser();

      if (result.isConfirmed) {
        await axios.put(
          `https://hewkad.com/api/admin/users/work-permit/${userId}`,
          { isActive: currentStatus ? 0 : 1 },
          { withCredentials: true }
        );

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.user_id === userId
              ? { ...u, is_Active: currentStatus ? 0 : 1 }
              : u
          )
        );

        // SweetAlert (unchanged)
        await MySwal.fire({
          title: currentStatus
            ? '<span style="color:#333;">Permit Revoked</span>'
            : '<span style="color:#333;">Permit Granted</span>',
          text: currentStatus
            ? "The Permit Is Now Disabled."
            : "The Permit Is Now Active.",
          icon: currentStatus ? "error" : "success",
          confirmButtonColor: currentStatus ? "red" : "#00c950",
          background: "#fff",
          customClass: {
            popup: "rounded-xl shadow-lg",
            container: "backdrop-blur",
          },
          backdrop: true,
        });
      }
    } catch (error) {
      console.error("❌ Error updating work permit:", error);
      MySwal.fire("Error", "Failed to update work permit status", "error");
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const result = await showUserDelete(user);

      if (result.isConfirmed) {
        await axios.delete(
          `https://hewkad.com/api/admin/users/delete/${user.user_id}`,
          {
            withCredentials: true,
          }
        );

        setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));

        // SweetAlert (unchanged)
        await MySwal.fire({
          title: '<span style="color:#333;">User Deleted</span>',
          text: "The user has been successfully removed.",
          icon: "success",
          confirmButtonColor: "#00c950",
          background: "#fff",
          customClass: {
            popup: "rounded-xl shadow-lg",
            container: "backdrop-blur",
          },
        });
      }
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      MySwal.fire("Error", "Failed to delete user", "error");
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">
            {/* Filter */}
            <div className="filter-con flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-8 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg">
              {/* Page Select */}
              <div className="relative w-full sm:w-56">
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none z-10">
                  Page
                </label>
                <select
                  className="select select-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-16 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Request">Request</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* User Page */}
            {pageType === "User" ? (
              <>
                <div className="card-con grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <div
                        key={index}
                        className="card bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50"
                      >
                        <div className="card-body items-center text-center p-6">
                          {/* Avatar - Styled like ProfilePage.js */}
                          <div className="relative group mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                <img
                                  src={resolveImg(user.picture)}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          {/* User Info - Styled like ProfilePage.js */}
                          <div className="id-name-con my-2">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1 text-center">
                              {user.name}
                            </h2>
                            <p className="text-slate-500 text-sm">
                              {user.email}
                            </p>
                          </div>

                          {/* Permit Toggle - Custom toggle matching the theme */}
                          <div className="flex items-center justify-between w-full max-w-xs px-2 py-2">
                            <p className="font-semibold mr-1 text-slate-700">
                              Work-Permitted
                            </p>
                            <label className="relative inline-block w-12 h-6">
                              <input
                                type="checkbox"
                                className="opacity-0 w-0 h-0"
                                checked={user.is_Active === 1}
                                onChange={() =>
                                  handleTogglePermit(
                                    user.user_id,
                                    user.is_Active === 1
                                  )
                                }
                              />
                              <span
                                className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ${
                                  user.is_Active === 1
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500" // Green/Teal for "on"
                                    : "bg-slate-300" // Gray for "off"
                                }`}
                              ></span>
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                                  user.is_Active === 1 ? "translate-x-6" : ""
                                }`}
                              ></span>
                            </label>
                          </div>

                          {/* Buttons - Styled with gradients */}
                          <div className="card-actions w-full flex-col gap-2 mt-4">
                            <button
                              onClick={() => showUserInfo(user)}
                              className="btn btn-block border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/50"
                            >
                              Information
                            </button>
                            <button
                              onClick={() =>
                                showUserLicense(user.identity_file)
                              }
                              className="btn btn-block border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50"
                            >
                              License
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="btn btn-block border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/30 hover:shadow-red-500/50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center col-span-3 py-10">
                      No users found.
                    </p>
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
              </>
            ) : (
              <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                
                {/* --- 1. Desktop Table --- */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table w-full text-center">
                    {/* Head */}
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          User ID
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Date
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Name
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Phone
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Address
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Bank
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Acc. Num
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Acc. Owner
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          File
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Verify
                        </th>
                        <th className="pb-4 pt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider bg-transparent">
                          Reject
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.length > 0 ? (
                        request.map((req, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50/50 border-b border-slate-200 last:border-b-0"
                          >
                            <td className="py-3 px-2 text-slate-800">
                              {req.user_id}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {new Date(req.update_at).toLocaleDateString(
                                "th-TH"
                              )}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.name}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.phone_num}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.address}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.bank_name}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.acc_number}
                            </td>
                            <td className="py-3 px-2 text-slate-800">
                              {req.acc_owner}
                            </td>
                            <td>
                              <button
                                onClick={() => showUserLicense(req.identity_file)}
                                className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"
                              >
                                View
                              </button>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  showConfirmVerify(req.user_id, req.name)
                                }
                                className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
                              >
                                Confirm
                              </button>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  showRejectVerify(req.user_id, req.name)
                                }
                                className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/20"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="text-slate-500 py-6">
                            No requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- 2. Mobile Card List --- */}
                <div className="md:hidden divide-y divide-slate-200">
                  {request.length > 0 ? (
                    request.map((req, index) => (
                      <div key={index} className="p-4">
                        {/* Top: Name/Date */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="font-semibold text-slate-900">{req.name}</div>
                            <div className="text-sm text-slate-500">ID: {req.user_id}</div>
                          </div>
                          <div className="text-sm text-slate-500 text-right flex-shrink-0">
                            {new Date(req.update_at).toLocaleDateString("th-TH")}
                          </div>
                        </div>
                        
                        {/* Middle: Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Phone</span>
                            <span className="text-slate-800 font-medium text-right">{req.phone_num || '-'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Address</span>
                            <span className="text-slate-800 font-medium text-right truncate">{req.address || '-'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Bank</span>
                            <span className="text-slate-800 font-medium text-right">{req.bank_name || '-'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Acc. Number</span>
                            <span className="text-slate-800 font-medium text-right">{req.acc_number || '-'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Acc. Owner</span>
                            <span className="text-slate-800 font-medium text-right truncate">{req.acc_owner || '-'}</span>
                          </div>
                        </div>

                        {/* Bottom: Buttons */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => showUserLicense(req.identity_file)}
                            className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"
                          >
                            View
                          </button>
                          <button
                            onClick={() => showConfirmVerify(req.user_id, req.name)}
                            className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => showRejectVerify(req.user_id, req.name)}
                            className="btn btn-sm border-none text-white font-medium shadow-md hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center p-6">
                      No requests found.
                    </p>
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
