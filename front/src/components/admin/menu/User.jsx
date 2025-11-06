import React, { useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  showUserInfo,
  showUserLicense,
  showUserDelete,
  showAllowPermitUser,
  showDisablePermitUser,
  showConfirmVerify,
  showRejectVerify,
} from "./features/SweetAlertUser";
import { CiSearch } from "react-icons/ci";

function UserCard({ user, permitted, onTogglePermit }) {
  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-[#171a1f] border border-gray-800 shadow-lg w-[320px]">
      <div className="flex items-center gap-3 w-full">
        <img src="/src/assets/avatar.svg" className="rounded-full w-16 h-16" />
        <div className="min-w-0">
          <p className="font-semibold truncate text-gray-100">{user.name}</p>
          <p className="text-gray-400 truncate">@{user.handle}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-medium text-xs text-gray-300">Work-Permitted</p>
          <label className="relative inline-block w-12 h-6 mt-1">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={permitted}
              onChange={() => onTogglePermit(user)}
            />
            <span
              className={`absolute inset-0 rounded-full transition ${
                permitted ? "bg-emerald-500" : "bg-gray-700"
              }`}
            />
            <span
              className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white transition ${
                permitted ? "translate-x-6" : ""
              }`}
            />
          </label>
        </div>
      </div>

      <div className="w-full mt-5 grid grid-cols-1 gap-2">
        <button
          onClick={() => showUserInfo(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500"
        >
          Information
        </button>
        <button
          onClick={() => showUserLicense(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-amber-500 hover:bg-amber-400"
        >
          License
        </button>
        <button
          onClick={() => showUserDelete(user)}
          className="text-sm text-white font-semibold p-2 w-full rounded-lg bg-rose-600 hover:bg-rose-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const MOCK_USERS = [
  { id: "u1", name: "Pongsakorn Srisawat", handle: "user01" },
  { id: "u2", name: "S Intharalib", handle: "user02" },
  { id: "u3", name: "Kanchana P.", handle: "user03" },
  { id: "u5", name: "Suda K.", handle: "suda" },
  { id: "u6", name: "Thanawat T.", handle: "thanawat" },
  { id: "u7", name: "Darin L.", handle: "darin" },
  { id: "u8", name: "Boss Dev", handle: "boss" },
];

export default function AdminUsers() {
  const MySwal = withReactContent(Swal);
  const [pageType, setPageType] = useState("User");
  const [query, setQuery] = useState("");
  const [permitMap, setPermitMap] = useState(
    Object.fromEntries(MOCK_USERS.map((u) => [u.id, true]))
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [query]);

  const onTogglePermit = async (user) => {
    const isOn = !!permitMap[user.id];
    if (!isOn) {
      const result = await showAllowPermitUser(user);
      if (result.isConfirmed) {
        setPermitMap((m) => ({ ...m, [user.id]: true }));
        await MySwal.fire({
          title: '<span style="color:#e5e7eb;">Permit Granted</span>',
          text: "The Permit Is Now Active.",
          icon: "success",
          confirmButtonColor: "#10b981",
          background: "#111316",
          color: "#e5e7eb",
          customClass: { popup: "rounded-2xl", container: "backdrop-blur" },
          backdrop: true,
        });
      }
    } else {
      const result = await showDisablePermitUser(user);
      if (result.isConfirmed) {
        setPermitMap((m) => ({ ...m, [user.id]: false }));
        await MySwal.fire({
          title: '<span style="color:#e5e7eb;">Permit Revoked</span>',
          text: "The Permit Is Now Disable.",
          icon: "error",
          confirmButtonColor: "#ef4444",
          background: "#111316",
          color: "#e5e7eb",
          customClass: { popup: "rounded-2xl", container: "backdrop-blur" },
          backdrop: true,
        });
      }
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-6">
        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Page</p>
          <select
            className="rounded-xl px-4 pb-2 pt-7 w-full bg-[#171a1f] text-gray-100 border border-gray-800"
            value={pageType}
            onChange={(e) => setPageType(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Request">Request</option>
          </select>
        </div>
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[56px] bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl pl-12 pr-4"
          />
          <CiSearch className="absolute size-6 left-4 top-[15px] text-gray-400" />
        </div>
      </div>

      {pageType === "User" ? (
        <div className="flex flex-wrap justify-start gap-6">
          {filteredUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              permitted={!!permitMap[u.id]}
              onTogglePermit={onTogglePermit}
            />
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-gray-400">No users found.</div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#171a1f]">
          <table className="w-full text-sm">
            <thead className="bg-[#1f2330] text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-left">Account No.</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Identity</th>
                <th className="px-4 py-3 text-left">Verify</th>
                <th className="px-4 py-3 text-left">Reject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-[#1a1d24] text-gray-100">
                <td className="px-4 py-3">@User2</td>
                <td className="px-4 py-3">21/02/2025</td>
                <td className="px-4 py-3">Pongsakorn Srisawat</td>
                <td className="px-4 py-3">0168888999</td>
                <td className="px-4 py-3">169/888 Sriracha</td>
                <td className="px-4 py-3">SCB</td>
                <td className="px-4 py-3">4581235446</td>
                <td className="px-4 py-3">Pongsakorn Srisawat</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => showUserLicense()}
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                  >
                    IMG.PNG
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => showConfirmVerify()}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Confirm
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => showRejectVerify()}
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
