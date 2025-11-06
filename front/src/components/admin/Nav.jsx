import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { RiBox3Line } from "react-icons/ri";
import { FiUser, FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LuBriefcase } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
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

  // --- Logic Functions (handleLogout, toggleSidebar, toggleSwitch) ---
  // --- ไม่มีการเปลี่ยนแปลง logic ---

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    navigate("/Admin", { replace: true });
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 h-screen z-50 shadow-xl border-r border-slate-200/50
          transition-transform duration-300 ease-in-out
          w-80 bg-white/80 backdrop-blur-xl ${ // 🎨 1. ปรับสไตล์พื้นหลังและขนาด
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="relative h-full flex flex-col">
          {/* 🎨 2. ปุ่ม Toggle Sidebar ใหม่ */}
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

          {/* 🎨 3. ส่วนหัว: Logo + Market Toggle */}
          <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/logo.svg"
                className="size-10" // 🎨 ปรับขนาด Logo
                alt="Logo"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Admin
              </span>
            </div>
          </div>

          {/* 🎨 5. โปรไฟล์ สไตล์ Gradient */}
          <div className="profile-con flex flex-col items-center p-6 border-b border-slate-200/50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img
                  src="/src/assets/avatar.svg"
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

          {/* 🎨 6. เมนู (ใช้ Component NavLink) */}
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
              to="/Activity"
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
          
          {/* 🎨 7. ปุ่ม Logout (อยู่ล่างสุด) */}
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

        {/* 🎨 8. Modal สไตล์ Glassmorphism */}
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