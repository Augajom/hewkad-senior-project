import React from "react";
import { ShoppingCart, Search, CreditCard, MessageCircle, User, Home, Clock } from "lucide-react";
import { Link } from 'react-router-dom';
import '../DaisyUI.css'

function Navbar() {
  return (
    <div className="w-full">
      {/* Top Navbar */}
      <div className="navbar bg-gray-100 px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/src/assets/logo.png" alt="Logo" className="w-30 h-20 object-cover" />
          {/* <span className="text-xl font-serif tracking-wide">HEW KAD</span> */}
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
          <Link to ="/ordering">
          <button className="btn btn-ghost relative">
            <ShoppingCart className="w-5 h-5 text-black" />
            <span className="ml-1 font-semibold text-black" >Ordering</span>

            {/* <div className="badge badge-info badge-sm absolute top-0 right-0">1</div> */}
          </button>
          </Link>
          

          <button className="btn btn-ghost">
            <CreditCard className="w-5 h-5 mr-1 text-black" />
            <span className="text-black">Payment</span>
          </button>

          <button className="btn btn-ghost btn-circle">
            <MessageCircle className="w-5 h-5 text-black" />
          </button>
          <Link to ="/profile">
            <button className="btn btn-ghost btn-circle">
            
            <User className="w-5 h-5 text-black" />
          </button>
            
            </Link>

          
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="navbar bg-white shadow-md border-t">
        <div className="flex justify-center items-center w-full gap-8">
          <button className="text-black text-base hover:text-cyan-500 transition-colors cursor-pointer" > 
            <Link to="/home" className="text-black text-base hover:text-cyan-500 transition-colors cursor-pointer">
  Home
</Link>
            
          </button>
          <button className="text-black text-base hover:text-cyan-500 transition-colors cursor-pointer">
            <Link to="/history" className="text-black text-base hover:text-cyan-500 transition-colors cursor-pointer">
            History
            </Link>
          </button>
          <button className="text-black text-base hover:text-cyan-500 transition-colors cursor-pointer">
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;