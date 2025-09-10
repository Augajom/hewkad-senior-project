import React from "react";
import { ShoppingCart, Search, CreditCard, MessageCircle, User } from "lucide-react";
import { Link } from 'react-router-dom'
import '../DaisyUI.css'

function Navbar({ currentPage, onNavigate, orderingCount }) {
  const baseBtnClass = "text-base transition-colors";
  const activeClass = "text-cyan-500 font-bold";
  const inactiveClass = "text-black hover:text-cyan-500";

  return (
    <div className="w-full">
      <div className="navbar bg-gray-100 px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/src/assets/logo.png" alt="Logo" className="w-30 h-20 object-cover" />
        </div>

        <div className="flex-1 mx-4 flex justify-center ">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-gray-200 rounded-full px-5 py-2 pr-12 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <Search className="w-5 h-5 absolute top-1/2 right-4 -translate-y-1/2 text-black" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("ordering")} className="btn btn-ghost relative">
            <ShoppingCart className="w-5 h-5 text-black" />
            <span className="ml-1 font-semibold text-black">Ordering</span>
            {orderingCount > 0 && (
              <div className="badge badge-info badge-sm absolute top-0 right-0">{orderingCount}</div>
            )}
          </button>
          
          <button className="btn btn-ghost">
            <CreditCard className="w-5 h-5 mr-1 text-black" />
            <span className="text-black">Payment</span>
          </button>

          <Link to="/Profile" className="btn btn-ghost btn-circle">
            <User className="w-5 h-5 text-black" />
          </Link>
        </div>
      </div>

      <div className="navbar bg-white shadow-md border-t">
        <div className="flex justify-center items-center w-full gap-8">
          <button
            onClick={() => onNavigate("home")}
            className={`${baseBtnClass} ${currentPage === "home" ? activeClass : inactiveClass}`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate("history")}
            className={`${baseBtnClass} ${currentPage === "history" ? activeClass : inactiveClass}`}
          >
            History
          </button>

          <button
            onClick={() => onNavigate("chat")}
            className={`${baseBtnClass} ${currentPage === "chat" ? activeClass : inactiveClass}`}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
