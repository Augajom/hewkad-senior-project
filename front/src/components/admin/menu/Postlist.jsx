import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../nav";
// Icon
import { CiSearch } from "react-icons/ci";

function Postlist() {
  const [posts, setPost] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/posts", {
        withCredentials: true,
      });
      console.log(res.data);
      setPost(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const postName = post?.name || "";
    return postName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="filter-con flex gap-2">
              {/* Markets */}
              <div className="posts-con relative w-full">
                <p className="absolute top-2 left-5 text-[#807a7a] text-sm">
                  Markets
                </p>
                <select className="rounded px-4 pb-2 pt-7 w-full bg-white shadow-xl">
                  <option value="All">All</option>
                  <option value="Today">กาดหน้ามอ</option>
                  <option value="Yesterday">กาดในมอ</option>
                </select>
              </div>

              <div className="searh-con relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <CiSearch className="absolute size-6 right-4 top-[18px]" />
              </div>
            </div>

            <div className="card-con flex flex-wrap gap-10 justify-center w-full max-w-7xl mx-auto">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl"
                  >
                    <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                      {post.price}฿
                    </p>
                    <div className="profile-con flex set-center">
                      <img
                        src={post.avatar || "/src/assets/avatar.svg"}
                        alt={post.nickname}
                        className="rounded-full w-16 h-16 object-cover"
                      />
                      <div className="id-name-con m-2">
                        <p className="font-bold">{post.nickname}</p>
                        <p className="text-gray-500">@{post.username}</p>
                      </div>
                      <div className="flex justify-start h-16">
                        <div className="status-con">
                          <p
                            className={`text-white font-semibold px-4 py-1 rounded ml-10 ${
                              post.status_name === "Available"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {post.status_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="details-con mt-2 text-xl">
                      <div className="location">
                        <b>สถานที่ส่ง : </b>
                        {post.delivery}
                      </div>
                      <div className="store">
                        <b>ชื่อร้าน : </b>
                        {post.store_name}
                      </div>
                      <div className="detail">
                        <b>สินค้า : </b>
                        {post.product}
                      </div>
                      <div className="price">
                        <b>ราคา : </b>
                        {post.price} บาท
                      </div>
                      <div className="market">
                        <b>ตลาด : </b>
                        {post.kad_name}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 col-span-3">No posts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Postlist;
