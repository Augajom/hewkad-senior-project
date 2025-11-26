import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import HistoryPostCard from '../components/HistoryPostCard';
import { SlArrowDown } from "react-icons/sl";
import '../DaisyUI.css';

export default function History() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  // ✅ ดึงโพสต์ตามสถานะ หรือทั้งหมด
  const fetchPosts = async (statusFilter = "All") => {
  setLoading(true);
  setError(null);

  try {
    const url =
      statusFilter === "All"
        ? "https://hewkad.com:2052/customer/history/All"
        : `https://hewkad.com:2052/customer/history/${statusFilter}`;

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch posts");

    const data = await res.json();

    // ไม่ต้อง filter ซ้ำแล้ว เพราะ backend จัดการแล้ว
    setPosts(data);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Dropdown filter status */}
      <div className="mt-5 ml-6">
        <div className="dropdown">
          <div tabIndex={0} className="btn m-1 bg-white text-black">
            <SlArrowDown /> Filter by Status
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-white rounded-box w-52"
          >
            <li className="text-black">
              <button onClick={() => { setSelectedStatus("All"); fetchPosts("All"); }}>
                All
              </button>
            </li>
            <li className="text-black">
              <button onClick={() => { setSelectedStatus("Complete"); fetchPosts("Complete"); }}>
                Complete
              </button>
            </li>
            <li className="text-black">
              <button onClick={() => { setSelectedStatus("Reporting"); fetchPosts("Reporting"); }}>
                Reporting
              </button>
            </li>
            <li className="text-black">
              <button onClick={() => { setSelectedStatus("Reported"); fetchPosts("Reported"); }}>
                Reported
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-8 container mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">
          History {selectedStatus !== "All" ? `- ${selectedStatus}` : ""}
        </h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">There are no items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {posts.map((post) => (
              <HistoryPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
