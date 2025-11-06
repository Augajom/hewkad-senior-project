import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../nav";
// Icon
import { CiSearch } from "react-icons/ci";

function Postlist() {
  const [posts, setPost] = useState([]);
  const [search, setSearch] = useState("");

  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("All");

  useEffect(() => {
    fetchMarkets();
    fetchPost();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/kad", {
        withCredentials: true,
      });
      setMarkets(res.data);
    } catch (error) {
      console.error("❌ Error fetching markets:", error);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/posts", {
        withCredentials: true,
      });
      console.log("post", res.data);
      setPost(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  const resolveImg = (imgPath) => {
    if (!imgPath) return "/src/assets/avatar.svg"; // default avatar
    if (imgPath.startsWith("http")) return imgPath; // external URL
    return `http://localhost:5000${imgPath}`; // local path
  };

  const filteredPosts = posts.filter((post) => {
    const text = `${post.nickname || ""} ${post.username || ""} ${
      post.store_name || ""
    }`;
    const matchesSearch = text.toLowerCase().includes(search.toLowerCase());
    const matchesMarket =
      selectedMarket === "All" ? true : post.kad_name === selectedMarket;

    return matchesSearch && matchesMarket;
  });

  const calPlatformFees = (fee) => {
    if (!fee) return 0;
    return Math.round(fee * 0.3);
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto flex flex-col items-center">

            <div className="filter-con flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-8 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg">
              
              {/* Markets Select (Label inside) */}
              <div className="relative w-full sm:w-64">
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none z-10">
                  Market
                </label>
                <select
                  className="select select-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-20 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="All">All</option>
                  {markets.map((market, index) => (
                    <option key={index} value={market.kad_name}>
                      {market.kad_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input (Icon inside) */}
              <div className="relative w-full sm:w-80">
                <CiSearch className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search nickname, store..."
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-con grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden" 
                  >
                    <p className="absolute text-red-600 text-3xl font-bold bottom-6 right-6 z-10">
                      {Math.round(
                        (post.service_fee - calPlatformFees(post.service_fee)) + post.price
                      )}
                      <span className="text-xl ml-1">฿</span>
                    </p>
                    <div className="card-body p-6 pt-6 px-6">
                      
                      <div className="profile-con flex justify-between items-center mb-4">
                        
                        {/* Left side: Avatar + Name */}
                        <div className="flex items-center">
                          <div className="avatar mr-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                <img
                                  src={resolveImg(post.avatar)}
                                  alt={post.nickname}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="id-name-con">
                            <p className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                              {post.nickname}
                            </p>
                            <p className="text-slate-500 text-sm">
                              @{post.username}
                            </p>
                          </div>
                        </div>

                        <div className="status-con">
                          <div
                            className={`badge text-white font-semibold px-4 py-3 rounded-lg border-none ${
                              post.status_name === "Available"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500" // Green/Teal
                                : "bg-slate-400" // Gray
                            }`}
                          >
                            {post.status_name}
                          </div>
                        </div>
                      </div> 
                      {/* End profile-con */}

                      {/* Details Section (No change, but now safe from price overlap) */}
                      <div className="details-con mt-2 space-y-2 text-base text-slate-800">
                        <div className="location">
                          <span className="font-semibold text-slate-600">
                            Delivery :{" "}
                          </span>
                          {post.delivery}
                        </div>
                        <div className="store">
                          <span className="font-semibold text-slate-600">
                            Store :{" "}
                          </span>
                          {post.store_name}
                        </div>
                        <div className="detail">
                          <span className="font-semibold text-slate-600">
                            Product :{" "}
                          </span>
                          {post.product}
                        </div>
                        <div className="price">
                          <span className="font-semibold text-slate-600">
                            Price :{" "}
                          </span>
                          {post.price} บาท
                        </div>
                        <div className="fee">
                          <span className="font-semibold text-slate-600">
                            Fee :{" "}
                          </span>
                          {post.service_fee} บาท
                        </div>
                        <div className="market">
                          <span className="font-semibold text-slate-600">
                            Market :{" "}
                          </span>
                          {post.kad_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                  No posts found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Postlist;