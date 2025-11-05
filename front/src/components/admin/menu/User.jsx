import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../nav";
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

function User() {
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
    return `http://localhost:5000${imgPath}`;
  };

  useEffect(() => {
    fetchUsers();
    fetchRequest();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users", {
        withCredentials: true,
      });
      console.log(res.data)
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      MySwal.fire("Error", "Failed to fetch users", "error");
    }
  };

  const fetchRequest = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users/request", {
        withCredentials: true,
      });
      console.log("Request", res.data);
      setRequest(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      MySwal.fire("Error", "Failed to fetch users", "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    const userName = user?.name || "";
    return userName.toLowerCase().includes(search.toLowerCase());
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
      // แสดง SweetAlert ก่อนอัปเดต
      const result = currentStatus
        ? await showDisablePermitUser()
        : await showAllowPermitUser();

      if (result.isConfirmed) {
        // เรียก API backend
        await axios.put(
          `http://localhost:5000/admin/users/work-permit/${userId}`,
          { isActive: currentStatus ? 0 : 1 },
          { withCredentials: true }
        );

        // อัปเดต state หน้า React
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.user_id === userId
              ? { ...u, is_Active: currentStatus ? 0 : 1 }
              : u
          )
        );

        // SweetAlert แจ้งผล
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
          `http://localhost:5000/admin/users/delete/${user.user_id}`,
          {
            withCredentials: true,
          }
        );

        // อัปเดตรายชื่อ users โดยลบ user ที่ถูกลบออก
        setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));

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
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            {/* 🔍 Filter */}
            <div className="filter-con flex gap-2">
              <div className="page-con relative w-full">
                <p className="absolute top-2 left-5 text-[#807a7a] text-sm">
                  Page
                </p>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <CiSearch className="absolute size-6 right-4 top-[18px]" />
              </div>
            </div>

            {/* 🧍 User Page */}
            {pageType === "User" ? (
              <>
                <div className="card-con grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl mx-auto mt-10">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <div
                        key={index}
                        className="card set-center flex-col w-auto h-auto p-5 rounded-xl bg-white shadow-2xl"
                      >
                        <div className="profile-con flex set-center">
                          <img
                            src={resolveImg(user.picture)}
                            alt={user.name}
                            className="rounded-full w-20 h-20 object-cover border border-gray-300"
                          />
                          <div className="id-name-con m-2">
                            <p className="font-bold">{user.name}</p>
                            <p className="text-gray-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="permit-con mt-3 flex">
                          <p className="font-semibold mr-1">Work-Permitted</p>
                          <div className="flex justify-end">
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
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              <span
                                className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${
                                  user.is_Active === 1 ? "translate-x-6" : ""
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        <div className="btn-con mt-4 w-full">
                          <button
                            onClick={() => showUserInfo(user)}
                            className="text-xl text-white font-semibold m-1 mt-3 p-2 w-full rounded-lg bg-green-500 cursor-pointer"
                          >
                            Information
                          </button>
                          <button
                            onClick={() => showUserLicense(user.identity_file)}
                            className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-orange-400 cursor-pointer"
                          >
                            License
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-xl text-white font-semibold m-1 p-2 w-full rounded-lg bg-red-500 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center col-span-3">
                      No users found.
                    </p>
                  )}
                </div>

                {/* 📄 Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-4 py-2 rounded-lg font-semibold shadow-md cursor-pointer ${
                          currentPage === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <table className="table-auto text-center my-6 mx-4 shadow-2xl border-separate border-spacing-x-0.5 border-spacing-y-1 w-full">
                <thead>
                  <tr>
                    <th className="bg-gray-300 px-4 py-2">User ID</th>
                    <th className="bg-gray-300 px-4 py-2">Date</th>
                    <th className="bg-gray-300 px-4 py-2">Name</th>
                    <th className="bg-gray-300 px-4 py-2">Phone Number</th>
                    <th className="bg-gray-300 px-4 py-2">Address</th>
                    <th className="bg-gray-300 px-4 py-2">Bank</th>
                    <th className="bg-gray-300 px-4 py-2">Account Number</th>
                    <th className="bg-gray-300 px-4 py-2">Account Owner</th>
                    <th className="bg-gray-300 px-4 py-2">Identity File</th>
                    <th className="bg-gray-300 px-4 py-2">Verify</th>
                    <th className="bg-gray-300 px-4 py-2">Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {request.length > 0 ? (
                    request.map((req, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2">{req.user_id}</td>
                        <td className="px-4 py-2">
                          {new Date(req.update_at).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-4 py-2">{req.name}</td>
                        <td className="px-4 py-2">{req.phone_num}</td>
                        <td className="px-4 py-2">{req.address}</td>
                        <td className="px-4 py-2">{req.bank_name}</td>
                        <td className="px-4 py-2">{req.acc_number}</td>
                        <td className="px-4 py-2">{req.acc_owner}</td>
                        <td className="text-blue-600 underline decoration-2 px-4 py-2">
                          <button
                            onClick={() => showUserLicense(req.identity_file)}
                            className="bg-blue-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => showConfirmVerify(req.user_id, req.name)}
                            className="bg-green-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer"
                          >
                            Confirm
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => showRejectVerify(req.user_id, req.name)}
                            className="bg-red-500 text-white rounded-3xl px-6 py-2 m-2 cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-gray-600 py-4">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default User;
