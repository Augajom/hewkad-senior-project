import React, { useState } from "react";
import { ShoppingCart, Search, CreditCard, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import '../DaisyUI.css';

function Navbar({ onSearchSubmit, orderingCount }) {
  const [searchValue, setSearchValue] = useState('');
  const baseBtnClass = "text-base transition-colors";
  const activeClass = "text-cyan-500 font-bold";
  const inactiveClass = "text-black hover:text-cyan-500";

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(searchValue);
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
          <img src="/src/assets/logo.png" alt="Logo" className="w-30 h-20 object-cover" />
        </div>

        <div className="flex-1 mx-4 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-gray-200 rounded-full px-5 py-2 pr-12 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="w-5 h-5 absolute top-1/2 right-4 -translate-y-1/2 text-black" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/service/ordering">
            <button className="btn btn-ghost relative">
              <ShoppingCart className="w-5 h-5 text-black" />
              <span className="ml-1 font-semibold text-black">Ordering</span>
              {orderingCount > 0 && (
                <div className="badge badge-info badge-sm absolute top-0 right-0">{orderingCount}</div>
              )}
            </button>
          </Link>

          

          <button className="btn btn-ghost btn-circle">
            <MessageCircle className="w-5 h-5 text-black" />
          </button>

          <Link to="/service/profile">
            <button className="btn btn-ghost btn-circle">
              <User className="w-5 h-5 text-black" />
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="navbar bg-white shadow-md border-t">
        <div className="flex justify-center items-center w-full gap-8">
          <Link to="/service/main" className={`${baseBtnClass} ${currentPath === "/service/main" ? activeClass : inactiveClass}`}>Home</Link>
          <Link to="/service/history" className={`${baseBtnClass} ${currentPath === "/service/history" ? activeClass : inactiveClass}`}>History</Link>
          <Link to="/service/chat" className={`${baseBtnClass} ${currentPath === "/service/chat" ? activeClass : inactiveClass}`}>Chat</Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
