import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { RiBox3Line } from "react-icons/ri";
import axios from "axios";
import {
  FiUser,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { LuBriefcase } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import logo from "../../assets/logo.svg";
import avatar from "../../assets/avatar.svg";
// BsDiamondHalf ถูกแทนที่ด้วย FiChevronLeft/Right
// import { BsDiamondHalf } from "react-icons/bs";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

// Helper component สำหรับ NavLink เพื่อลดโค้ดซ้ำซ้อน
function NavLink({ to, icon, label, currentPath }) {
  const isActive = currentPath.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
          : "text-slate-600 hover:bg-white hover:shadow-md"
      }`}
    >
      {icon}
      <span className="text-lg font-semibold">{label}</span>
    </Link>
  );
}

function Nav() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOn, setIsOn] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/admin/market-status`, {
          withCredentials: true,
          headers: {
            "Authorization": token ? `Bearer ${token}` : "", 
          }
        });

        if (response.data.success) {
          setIsOn(response.data.isOpen);
        }
      } catch (error) {
        console.error("Failed to fetch market status", error);
        if (error.response && (error.response.status === 498 || error.response.status === 401)) {
        }
      }
    };
    fetchMarketStatus();
  }, []);

  const updateMarketStatusApi = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/admin/market-status`,
        { isOpen: status },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        }
      );
    } catch (error) {
      console.error("Failed to update market status", error);
      // Revert state กลับถ้า API พัง (Optional)
      setIsOn(!status); 
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status. Please try again.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, {
         withCredentials: true 
      });
    } catch (error) {
        console.error("Logout error", error);
    }

    localStorage.removeItem('token'); 
    navigate("/Admin", { replace: true });
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  //sweetalert2
  const toggleSwitch = async () => {
    if (!isOn) {
      // กำลังจะ "เปิด"
      const result = await MySwal.fire({
        html: `
            <div style="display: flex; text-align: center; justify-content: center;">
              <div>
                <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Market Opening</p>
                <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">  Are you sure you want to <br />open the market?</p>
              </div>
            </div>
          `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00c950",
        cancelButtonColor: "gray",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
        reverseButtons: true,
        background: "#ffffff",
        customClass: {
          popup: "rounded-xl shadow-lg",
          container: "backdrop-blur",
        },
        backdrop: true,
      });
      if (result.isConfirmed) {
        setIsOn(true);
        await updateMarketStatusApi(true);
        await MySwal.fire({
          title: '<span style="color:#333;">Market Opened</span>',
          text: "The Market Is Now Open.",
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
      const result = await MySwal.fire({
        html: `
            <div style="display: flex; text-align: center; justify-content: center;">
              <div>
                <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Market Closure</p>
                <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to <br />close the market?</p>
              </div>
            </div>
          `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "red",
        cancelButtonColor: "gray",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
        reverseButtons: true,
        background: "#ffffff",
        customClass: {
          popup: "rounded-xl shadow-lg",
          container: "backdrop-blur",
        },
        backdrop: true,
      });
      if (result.isConfirmed) {
        setIsOn(false);
        await updateMarketStatusApi(false);
        await MySwal.fire({
          title: '<span style="color:#333;">Market Closed</span>',
          text: "The Market is Now Closed.",
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
      <nav
        className={`fixed top-0 left-0 h-screen z-50 shadow-xl border-r border-slate-200/50
          transition-transform duration-300 ease-in-out
          w-80 bg-white/80 backdrop-blur-xl ${
            isCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        <div className="relative h-full flex flex-col">
          <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -translate-y-1/2 -right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center 
              bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/50 text-slate-700 hover:bg-white transition-all cursor-pointer"
          >
            {isCollapsed ? (
              <FiChevronRight className="w-6 h-6" />
            ) : (
              <FiChevronLeft className="w-6 h-6" />
            )}
          </button>
          <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <img src={logo} className="size-10" alt="Logo" />
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Admin
              </span>
            </div>

            <div className="switch flex gap-1 mt-1 items-center">
                <span className="font-semibold text-xs text-black">
                  {isOn ? "Market is Open" : "Market is Close"}
                </span>

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
          <div className="profile-con flex flex-col items-center p-6 border-b border-slate-200/50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img
                  src={avatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
            </div>
            <div className="name-con text-center">
              <p className="text-sm text-slate-500">Welcome</p>
              <p className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                S INTHARALIB
              </p>
            </div>
          </div>

          <div className="menu-con flex-grow p-4 space-y-2 overflow-y-auto">
            <NavLink
              to="/Dashboard"
              icon={<RiBox3Line className="w-6 h-6" />}
              label="DASHBOARD"
              currentPath={location.pathname}
            />
            <NavLink
              to="/User"
              icon={<FiUser className="w-6 h-6" />}
              label="USER"
              currentPath={location.pathname}
            />
            <NavLink
              to="/Postlist"
              icon={<FiActivity className="w-6 h-6" />}
              label="POSTLIST"
              currentPath={location.pathname}
            />
            <NavLink
              to="/Payment"
              icon={<LuBriefcase className="w-6 h-6" />}
              label="PAYMENT"
              currentPath={location.pathname}
            />
            <NavLink
              to="/History"
              icon={<FaRegFileAlt className="w-6 h-6" />}
              label="HISTORY"
              currentPath={location.pathname}
            />
            <NavLink
              to="/report"
              icon={<FaRegFileAlt className="w-6 h-6" />}
              label="REPORT"
              currentPath={location.pathname}
            />
          </div>

          <div className="logout-con p-4 border-t border-slate-200/50">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-slate-600 transition-all duration-300 hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
            >
              <MdOutlineLogout className="w-6 h-6" />
              <p className="text-lg font-semibold">LOGOUT</p>
            </button>
          </div>
        </div>

        {showLogoutModal && (
          <dialog className="modal modal-open bg-black/50 backdrop-blur-sm">
            <div className="modal-box bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-sm text-slate-900">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <MdOutlineLogout className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-center mb-2">
                Confirm Logout
              </h3>
              <p className="text-center text-slate-600 mb-8">
                Are you sure you want to logout?
              </p>
              <div className="modal-action flex flex-col sm:flex-row justify-center gap-3">
                <button
                  className="btn flex-1 bg-slate-100 hover:bg-slate-200 border-none text-slate-800"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn flex-1 border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/30 hover:shadow-red-500/50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </dialog>
        )}
      </nav>
    </>
  );
}

export default Nav;
