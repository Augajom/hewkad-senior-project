import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/navbar";
import HistoryPostCard from "../components/HistoryPostCard";
import { SlArrowDown } from "react-icons/sl";
import "../DaisyUI.css";

const API = "http://localhost:5000";

export default function History() {
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Complete");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPosts = async (status = "Complete") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/customer/history/${encodeURIComponent(status)}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please login");
        throw new Error("Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Something went wrong");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(statusFilter);
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) =>
      Object.values(p).some((v) => v && v.toString().toLowerCase().includes(q))
    );
  }, [posts, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar onSearchSubmit={setSearch} />

      {/* Sticky controls header (matches user UI vibe) */}
      <header className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Dropdown (mobile friendly) */}
          <div className="flex items-center gap-2">
            <div className="dropdown">
              <div tabIndex={0} className="btn bg-white/90 text-slate-900 rounded-xl">
                <SlArrowDown className="mr-2" />
                Filter by Status
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-2xl w-56 text-slate-900">
                {["Complete", "Reported", "Pending"].map((s) => (
                  <li key={s}>
                    <button onClick={() => setStatusFilter(s)}>{s}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabs (quick switch) */}
            <div className="tabs tabs-boxed bg-white/70 ml-2">
              {["Complete", "Reported", "Pending"].map((s) => (
                <button
                  key={s}
                  className={`tab ${statusFilter === s ? "tab-active text-cyan-700" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search in-page (optional, in addition to global navbar search) */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search in history…"
              className="input input-bordered w-full bg-white/90 text-slate-900 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          History
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-white/60 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 font-semibold mb-2">เกิดข้อผิดพลาด</div>
            <div className="text-slate-600">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
            ยังไม่มีรายการ
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filtered.map((post) => (
              <HistoryPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
