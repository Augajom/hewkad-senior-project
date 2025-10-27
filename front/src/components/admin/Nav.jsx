import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// SweetAlert2
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// Icon
import { RiBox3Line } from "react-icons/ri";
import { FiUser } from "react-icons/fi";
import { FiActivity } from "react-icons/fi";
import { LuBriefcase } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { BsDiamondHalf } from "react-icons/bs";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function Nav() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();

  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOn, setIsOn] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    navigate("/Admin", { replace: true });
  };

  // toggle
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
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#00c950',
          cancelButtonColor: 'gray',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Confirm',
          reverseButtons: true,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-xl shadow-lg',
            container: 'backdrop-blur',
          },
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
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'red',
          cancelButtonColor: 'gray',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Confirm',
          reverseButtons: true,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-xl shadow-lg',
            container: 'backdrop-blur',
          },
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
    <nav
      className={`fixed top-0 left-0 h-screen bg-gray-300 z-50 shadow-lg border-r transition-transform duration-300 ${
        isCollapsed ? "-translate-x-88" : "translate-x-0"
      } w-[350px]`} // w-94 = 94 * 4 = 376px
    >
      <div className="relative w-full px-4 text-black">
        <button onClick={toggleSidebar}>
          <BsDiamondHalf className="absolute size-10 -right-5 top-80 transform scale-x-[-1] cursor-pointer" />
        </button>
        <div className="switch-con">
          <div className="flex justify-end mx-10 mt-2 mb-4">
            <img
              src="/src/assets/logo.svg"
              className="absolute top-1 left-12 size-20"
            />
            <div className="switch flex gap-1 mt-1">
              <span className="font-semibold text-sm ">
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
        </div>

        <div className="profile-con set-center">
          <img
            src="/src/assets/avatar.svg"
            className="rounded-full mr-4 size-20"
          />
          <div className="name-con">
            <p className="text-2xl font-semibold">Welcome</p>
            <p className="text-xl font-semibold">S INTHARALIB</p>
          </div>
        </div>

        <div className="menu-con flex justify-center">
          <div className="menu">
            <p className="font-semibold mt-4 mb-4 text-xl">MENU</p>
            <div className="dashboard-con mb-6">
              <Link
                to="/Dashboard"
                className={`flex items-center mb-6 space-x-4 transition duration-300 ${
                  location.pathname.startsWith("/Dashboard")
                    ? "text-purple-700"
                    : "text-black"
                } hover:text-green-500`}
              >
                <div className="size-14 rounded-full border flex items-center justify-center">
                  <RiBox3Line className="size-10" />
                </div>
                <p className="text-2xl font-semibold">DASHBOARD</p>
              </Link>

              <div className="user-con mb-6">
                <Link
                  to="/User"
                  className={`flex items-center mb-4 space-x-4 transition duration-300 ${
                    location.pathname.startsWith("/User")
                      ? "text-purple-700"
                      : "text-black"
                  } hover:text-green-500`}
                >
                  <div className="size-14 rounded-full border flex items-center justify-center">
                    <FiUser className="size-10" />
                  </div>
                  <p className="text-2xl font-semibold">USER</p>
                </Link>
              </div>

              <div className="postlist-con mb-6 ">
                <Link
                  to="/Postlist"
                  className={`flex items-center mb-4 space-x-4 transition duration-300 ${
                    location.pathname.startsWith("/Postlist")
                      ? "text-purple-700"
                      : "text-black"
                  } hover:text-green-500`}
                >
                  <div className="size-14 rounded-full border flex items-center justify-center">
                    <FiActivity className="size-10" />
                  </div>
                  <p className="text-2xl font-semibold">POSTLIST</p>
                </Link>
              </div>

              <div className="payment-con mb-6 ">
                <Link
                  to="/Payment"
                  className={`flex items-center mb-4 space-x-4 transition duration-300 ${
                    location.pathname.startsWith("/Payment")
                      ? "text-purple-700"
                      : "text-black"
                  } hover:text-green-500`}
                >
                  <div className="size-14 rounded-full border flex items-center justify-center">
                    <LuBriefcase className="size-10" />
                  </div>
                  <p className="text-2xl font-semibold">PAYMENT</p>
                </Link>
              </div>

              <div className="history-con mb-6 ">
                <Link
                  to="/Activity"
                  className={`flex items-center mb-4 space-x-4 transition duration-300 ${
                    location.pathname.startsWith("/Activity")
                      ? "text-purple-700"
                      : "text-black"
                  } hover:text-green-500`}
                >
                  <div className="size-14 rounded-full border flex items-center justify-center">
                    <FaRegFileAlt className="size-10" />
                  </div>
                  <p className="text-2xl font-semibold">ACTIVITY</p>
                </Link>
              </div>

              <div className="logout-con mb-6 ">
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
            <h3 className="font-bold text-lg text-center mb-4">
              Confirm Logout
            </h3>
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
      </div>
    </nav>
  );
}

export default Nav;
