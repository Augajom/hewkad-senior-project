import React, { useMemo, useState } from "react";
import AdminLayout from "../AdminLayout.jsx";
import { CiSearch } from "react-icons/ci";

const STATUS_MAP = {
  Available: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  Reserved: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  Closed: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  Default: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
};

const PriceBadge = ({ value }) => (
  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow">
    {value}
  </div>
);

const StatusChip = ({ status }) => {
  const cls = STATUS_MAP[status] || STATUS_MAP.Default;
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{status || "Unknown"}</span>;
};

const MOCK = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  user: { name: "Name", handle: "XXXXX" },
  status: ["Available", "Reserved", "Closed"][i % 3],
  deliverTo: "F1",
  store: "นายอ้วนไก่หมี่คลุก",
  product: "หมี่ไก่ฉีก 1 ถ้วย",
  price: 500,
  market: i % 2 === 0 ? "กาดในมอ" : "กาดหน้ามอ",
  total: "35฿",
}));

export default function AdminPostlist() {
  const [market, setMarket] = useState("All");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const data = useMemo(() => {
    let list = [...MOCK];
    if (market !== "All") list = list.filter((p) => p.market === market);
    if (status !== "All") list = list.filter((p) => p.status === status);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) =>
        [p.user.name, p.user.handle, p.store, p.product, p.market, p.status].join(" ").toLowerCase().includes(s)
      );
    }
    if (sortBy === "Price High") list.sort((a, b) => b.price - a.price);
    if (sortBy === "Price Low") list.sort((a, b) => a.price - b.price);
    return list;
  }, [market, status, q, sortBy]);

  return (
    <AdminLayout title="Posts">
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-3 items-end mb-6">
        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Markets</p>
          <select
            className="rounded-xl px-4 pb-2 pt-7 w-full bg-[#171a1f] text-gray-100 border border-gray-800"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          >
            <option>All</option>
            <option>กาดหน้ามอ</option>
            <option>กาดในมอ</option>
          </select>
        </div>
        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Status</p>
          <select
            className="rounded-xl px-4 pb-2 pt-7 w-full bg-[#171a1f] text-gray-100 border border-gray-800"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            <option>Available</option>
            <option>Reserved</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="relative">
          <p className="absolute top-2 left-4 text-gray-400 text-xs">Sort</p>
          <select
            className="rounded-xl px-4 pb-2 pt-7 w-full bg-[#171a1f] text-gray-100 border border-gray-800"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Price High</option>
            <option>Price Low</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full h-[56px] bg-[#171a1f] text-gray-100 border border-gray-800 rounded-xl pl-12 pr-4"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <CiSearch className="absolute size-6 left-4 top-[15px] text-gray-400" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#171a1f] p-12 text-center text-gray-400">
          No posts found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((p) => (
            <div
              key={p.id}
              className="relative bg-[#171a1f] border border-gray-800 rounded-2xl p-5 text-gray-100 hover:border-indigo-600/40 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src="/src/assets/avatar.svg" className="rounded-full w-12 h-12" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.user.name}</p>
                  <p className="text-gray-400 text-sm truncate">@{p.user.handle}</p>
                </div>
                <div className="ml-auto">
                  <StatusChip status={p.status} />
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">สถานที่ส่ง</span>
                  <span className="font-medium">{p.deliverTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ชื่อร้าน</span>
                  <span className="font-medium truncate max-w-[60%] text-right">{p.store}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">หิ้ว</span>
                  <span className="font-medium truncate max-w-[60%] text-right">{p.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ราคา</span>
                  <span className="font-semibold">{p.price.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ตลาด</span>
                  <span className="font-medium">{p.market}</span>
                </div>
              </div>
              <div className="mt-10">
                <PriceBadge value={p.total} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-400">Total: {data.length} posts</div>
    </AdminLayout>
  );
}
