import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, MessageCircle, User, Menu, X } from "lucide-react";
import "../DaisyUI.css";

function Navbar({ orderingCount = 0, onSearchSubmit }) {
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = location.pathname;

  const isActive = useMemo(
    () => (path) => current === path || (path !== "/" && current.startsWith(path)),
    [current]
  );

  const triggerSearch = () => {
    if (!onSearchSubmit) return;
    onSearchSubmit(searchValue.trim());
    setOpen(false);
  };

  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <img src="/src/assets/logo.png" alt="Logo" className="w-24 h-12 object-contain" />
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, brands, categories…"
                  className="w-full bg-slate-100/80 rounded-full px-5 py-2.5 pr-12 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                />
                <button
                  aria-label="Search"
                  onClick={triggerSearch}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-200/70"
                >
                  <Search className="w-5 h-5 text-slate-800" />
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/user/ordering">
                <button
                  className={`btn btn-ghost relative ${
                    isActive("/user/ordering") ? "text-cyan-600 font-semibold" : "text-slate-900 hover:text-cyan-600"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="ml-1">Ordering</span>
                  {orderingCount > 0 && (
                    <div className="badge badge-info badge-sm absolute -top-1 -right-1">{orderingCount}</div>
                  )}
                </button>
              </Link>

              <Link to="/messages">
                <button
                  className={`btn btn-ghost btn-circle ${
                    isActive("/messages") ? "text-cyan-600" : "text-slate-900 hover:text-cyan-600"
                  }`}
                  aria-label="Messages"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </Link>

              <Link to="/user/profile">
                <button
                  className={`btn btn-ghost btn-circle ${
                    isActive("/user/profile") ? "text-cyan-600" : "text-slate-900 hover:text-cyan-600"
                  }`}
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
              </Link>
            </nav>

            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 border border-slate-200 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands, categories…"
                  className="w-full bg-slate-100/80 rounded-xl px-4 py-2.5 pr-11 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                />
                <button
                  aria-label="Search"
                  onClick={triggerSearch}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200/70"
                >
                  <Search className="w-5 h-5 text-slate-800" />
                </button>
              </div>

              <Link to="/user/ordering" onClick={() => setOpen(false)}>
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                    isActive("/user/ordering") ? "bg-cyan-50 text-cyan-700" : "hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Ordering</span>
                  </div>
                  {orderingCount > 0 && <span className="badge badge-info badge-sm">{orderingCount}</span>}
                </div>
              </Link>

              <Link to="/messages" onClick={() => setOpen(false)}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive("/messages") ? "bg-cyan-50 text-cyan-700" : "hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Messages</span>
                </div>
              </Link>

              <Link to="/user/profile" onClick={() => setOpen(false)}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive("/user/profile") ? "bg-cyan-50 text-cyan-700" : "hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </header>
      <nav className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60">
              <div className="max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center gap-8">
                <Link
                  to="/user/home"
                  className={`text-sm transition-colors ${
                    isActive("/user/home")
                      ? "text-cyan-600 font-semibold"
                      : "text-slate-900 hover:text-cyan-600"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/user/history"
                  className={`text-sm transition-colors ${
                    isActive("/user/history")
                      ? "text-cyan-600 font-semibold"
                      : "text-slate-900 hover:text-cyan-600"
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/user/chat"
                  className={`text-sm transition-colors ${
                    isActive("/user/chat")
                      ? "text-cyan-600 font-semibold"
                      : "text-slate-900 hover:text-cyan-600"
                  }`}
                >
                  Chat
                </Link>
              </div>
            </nav>
    </div>
  );
}

export default Navbar;
