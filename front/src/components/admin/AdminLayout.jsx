import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiSettings } from "react-icons/fi";
import { MdOutlineLogout, MdOutlinePayment, MdMenu, MdClose, MdListAlt, MdReport } from "react-icons/md";

export default function AdminLayout({ title, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const menu = [
    { to: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { to: "/user", label: "Users", icon: <FiUsers /> },
    { to: "/activity", label: "Activity", icon: <FiSettings /> },
    { to: "/payment", label: "Payment", icon: <MdOutlinePayment /> },
    { to: "/postlist", label: "Postlist", icon: <MdListAlt /> },
    { to: "/report", label: "Report", icon: <MdReport /> },
  ];

  const handleLogout = () => navigate("/Admin", { replace: true });

  const LinkItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-xl transition ${
          isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800"
        }`
      }
      end
    >
      <span className="text-lg">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-[#111316] text-gray-100">
      <aside className="hidden md:flex w-64 shrink-0 bg-[#171a1f] border-r border-gray-800 flex-col">
        <div className="px-4 py-6 text-2xl font-bold tracking-tight">Admin Panel</div>
        <nav className="px-3 space-y-2">
          {menu.map((m) => (
            <LinkItem key={m.to} to={m.to} icon={m.icon} label={m.label} />
          ))}
        </nav>
        <div className="mt-auto p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-gray-800"
          >
            <MdOutlineLogout className="text-xl" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 right-6 z-50 h-10 w-10 grid place-items-center rounded-xl bg-[#171a1f] border border-gray-800"
          aria-label="Open sidebar"
        >
          <MdMenu className="text-xl" />
        </button>
        {open && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-[#171a1f] border-r border-gray-800 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold">Admin Panel</div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-lg bg-[#111316] border border-gray-800"
                  aria-label="Close sidebar"
                >
                  <MdClose />
                </button>
              </div>
              <nav className="space-y-2 overflow-y-auto">
                {menu.map((m) => (
                  <LinkItem key={m.to} to={m.to} icon={m.icon} label={m.label} />
                ))}
              </nav>
              <div className="mt-auto pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-gray-800"
                >
                  <MdOutlineLogout className="text-xl" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-[#111316]/80 backdrop-blur border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold">{title || "Admin"}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
