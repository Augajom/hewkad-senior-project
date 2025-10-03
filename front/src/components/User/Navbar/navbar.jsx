import React from "react";
import { ShoppingCart, Search, CreditCard, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../DaisyUI.css";

function Navbar({ currentPage, onNavigate, orderingCount, onSearchSubmit }) {
  const baseBtnClass = "text-base transition-colors";
  const activeClass = "text-cyan-500 font-bold";
  const inactiveClass = "text-black hover:text-cyan-500";

  // ฟังก์ชันเมื่อกด Enter ใน search input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit(e.target.value); // ส่งค่าไป parent (Home)
    }
  };

  // ใช้ useLocation เพื่อเช็ค path ปัจจุบัน
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-full">
      {/* Top Navbar */}
      <div className="navbar bg-gray-100 px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src="/src/assets/logo.png"
            alt="Logo"
            className="w-30 h-20 object-cover"
          />
        </div>

        {/* Search Box */}
        <div className="flex-1 mx-4 flex justify-center text-base-content text-black">
          <div className="relative w-full max-w-md text-base-content text-black">
            <input
              type="text"
              placeholder="Search here..."
              className=" input input-bordered w-full max-w-md placeholder-gray-500 bg-white text-black"
              onKeyDown={handleKeyDown} // ✅ Enter key
            />
            <Search className="w-5 h-5 absolute top-1/2 right-4 -translate-y-1/2" />
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("ordering")}
            className="btn btn-ghost relative"
          >
            <ShoppingCart className="w-5 h-5 text-black" />
            <span className="ml-1 font-semibold text-black">Ordering</span>
            {orderingCount > 0 && (
              <div className="badge badge-info badge-sm absolute top-0 right-0">
                {orderingCount}
              </div>
            )}
          </button>

          <button className="btn btn-ghost">
            <CreditCard className="w-5 h-5 mr-1 text-black" />
            <span className="text-black">Payment</span>
          </button>

          <Link to="/provider/profile" className="btn btn-ghost btn-circle">
            <User className="w-5 h-5 text-black" />
          </Link>
        </div>
      </div>

      {/* Bottom Navbar (Navigation) */}
      <div className="navbar bg-white shadow-md border-t">
        <div className="flex justify-center items-center w-full gap-8">
          <Link to="/main" className={`${baseBtnClass} ${currentPath === "/main" ? activeClass : inactiveClass}`}>Home</Link>
          {/* <Link to="/history" className={`${baseBtnClass} ${currentPath === "/history" ? activeClass : inactiveClass}`}>History</Link>
          <Link to="/chat" className={`${baseBtnClass} ${currentPath === "/chat" ? activeClass : inactiveClass}`}>Chat</Link> */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
