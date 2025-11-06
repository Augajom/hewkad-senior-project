import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { RiBox3Line } from "react-icons/ri";
import { FiUser, FiActivity } from "react-icons/fi";
import { LuBriefcase } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { BsDiamondHalf } from "react-icons/bs";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function MenuItem({ to, active, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className={`flex items-center mb-6 space-x-4 transition duration-300 ${active ? "text-purple-700" : "text-black"} hover:text-green-500`}
    >
      <div className="size-14 rounded-full border flex items-center justify-center">
        <Icon className="size-10" />
      </div>
      <p className="text-2xl font-semibold">{label}</p>
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
    } catch {}
    navigate("/Admin", { replace: true });
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleSwitch = async () => {
    if (!isOn) {
      const result = await MySwal.fire({
        html: `
          <div style="display:flex;justify-content:center;text-align:center">
            <div>
              <p style="color:#000;font-size:24px;font-weight:700">Confirm Market Opening</p>
              <p style="color:#807a7a;font-size:28px;font-weight:400;margin-top:10px">Are you sure you want to <br />open the market?</p>
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
        customClass: { popup: "rounded-xl shadow-lg", container: "backdrop-blur" },
        backdrop: true,
      });
      if (result.isConfirmed) {
        setIsOn(true);
        await MySwal.fire({
          title: '<span style="color:#333;">Market Opened</span>',
          text: "The Market Is Now Open.",
          icon: "success",
          confirmButtonColor: "#00c950",
          background: "#fff",
          customClass: { popup: "rounded-xl shadow-lg", container: "backdrop-blur" },
          backdrop: true,
        });
      }
    } else {
      const result = await MySwal.fire({
        html: `
          <div style="display:flex;justify-content:center;text-align:center">
            <div>
              <p style="color:#000;font-size:24px;font-weight:700">Confirm Market Closure</p>
              <p style="color:#807a7a;font-size:28px;font-weight:400;margin-top:10px">Are you sure you want to <br />close the market?</p>
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
        customClass: { popup: "rounded-xl shadow-lg", container: "backdrop-blur" },
        backdrop: true,
      });
      if (result.isConfirmed) {
        setIsOn(false);
        await MySwal.fire({
          title: '<span style="color:#333;">Market Closed</span>',
          text: "The Market is Now Closed.",
          icon: "error",
          confirmButtonColor: "red",
          background: "#fff",
          customClass: { popup: "rounded-xl shadow-lg", container: "backdrop-blur" },
          backdrop: true,
        });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 h-screen bg-gray-300 z-50 shadow-lg border-r transition-transform duration-300 ${
        isCollapsed ? "-translate-x-[350px]" : "translate-x-0"
      } w-[350px]`}
    >
      <div className="relative w-full px-4 text-black">
        <button onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <BsDiamondHalf className="absolute size-10 -right-5 top-80 transform scale-x-[-1] cursor-pointer" />
        </button>

        <div className="switch-con">
          <div className="flex justify-end mx-10 mt-2 mb-4">
            <img src="/src/assets/logo.svg" alt="Logo" className="absolute top-1 left-12 size-20" />
            <div className="switch flex gap-1 mt-1">
              <span className="font-semibold text-sm">{isOn ? "Market is Open" : "Market is Close"}</span>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="opacity-0 w-0 h-0" checked={isOn} onChange={toggleSwitch} />
                <span className={`absolute inset-0 cursor-pointer rounded-full transition duration-300 ${isOn ? "bg-green-500" : "bg-gray-800"}`} />
                <span className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition transform duration-300 ${isOn ? "translate-x-6" : ""}`} />
              </label>
            </div>
          </div>
        </div>

        <div className="profile-con set-center">
          <img src="/src/assets/avatar.svg" alt="Avatar" className="rounded-full mr-4 size-20" />
          <div className="name-con">
            <p className="text-2xl font-semibold">Welcome</p>
            <p className="text-xl font-semibold">S INTHARALIB</p>
          </div>
        </div>

        <div className="menu-con flex justify-center">
          <div className="menu">
            <p className="font-semibold mt-4 mb-4 text-xl">MENU</p>

            <div className="dashboard-con mb-6">
              <MenuItem
                to="/Dashboard"
                icon={RiBox3Line}
                label="DASHBOARD"
                active={location.pathname.startsWith("/Dashboard")}
              />
            </div>

            <div className="user-con mb-6">
              <MenuItem
                to="/User"
                icon={FiUser}
                label="USER"
                active={location.pathname.startsWith("/User")}
              />
            </div>

            <div className="postlist-con mb-6">
              <MenuItem
                to="/Postlist"
                icon={FiActivity}
                label="POSTLIST"
                active={location.pathname.startsWith("/Postlist")}
              />
            </div>

            <div className="payment-con mb-6">
              <MenuItem
                to="/Payment"
                icon={LuBriefcase}
                label="PAYMENT"
                active={location.pathname.startsWith("/Payment")}
              />
            </div>

            <div className="history-con mb-6">
              <MenuItem
                to="/Activity"
                icon={FaRegFileAlt}
                label="ACTIVITY"
                active={location.pathname.startsWith("/Activity")}
              />
            </div>

            <div className="history-con mb-6">
              <MenuItem
                to="/report"
                icon={FaRegFileAlt}
                label="Report"
                active={location.pathname.startsWith("/report")}
              />
            </div>

            <div className="logout-con mb-6">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center mb-4 space-x-4 hover:text-red-500 transition duration-300"
              >
                <div className="size-14 rounded-full border flex items-center justify-center">
                  <MdOutlineLogout className="size-10" />
                </div>
                <p className="text-2xl font-semibold">LOGOUT</p>
              </button>
            </div>

            {showLogoutModal && (
              <dialog className="modal modal-open">
                <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black max-w-sm mx-auto">
                  <h3 className="font-bold text-lg text-center mb-4">Confirm Logout</h3>
                  <p className="text-center mb-6">You sure to logout?</p>
                  <div className="modal-action flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      className="btn btn-ghost w-full sm:w-auto px-8 text-red-500 bg-white"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-success w-full sm:w-auto px-8 text-black"
                      onClick={handleLogout}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
