import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/navbar";
import PostCard from "../components/Postcard";
import KadDropdown from "../components/KadDropdown";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs from "dayjs";
import "../DaisyUI.css";

const API = "http://localhost:5000";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(dayjs());
  const [minTime, setMinTime] = useState(dayjs());
  const [orderingCount, setOrderingCount] = useState(0);
  const [formData, setFormData] = useState({
    kadId: "",
    storeName: "",
    product: "",
    serviceFee: "",
    price: "",
    delivery: "",
    delivery_at: "",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
  const [statusTab, setStatusTab] = useState("Available");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async (status = "Available") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/customer/posts?status=${status}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKadOptions = async () => {
    try {
      const res = await fetch(`${API}/customer/kad`, { credentials: "include" });
      const data = await res.json();
      setKadOptions(Array.isArray(data) ? data : []);
    } catch {
      setKadOptions([]);
    }
  };

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d))
      .catch(() => {});
    fetchPosts(statusTab);
    fetchKadOptions();
  }, []);

  useEffect(() => {
    fetchPosts(statusTab);
  }, [statusTab]);

  const filteredPosts = useMemo(() => {
    let temp = [...posts];
    if (selectedKad.length > 0) temp = temp.filter((p) => selectedKad.includes(p.kad_name));
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      temp = temp.filter((p) => Object.values(p).some((v) => v && v.toString().toLowerCase().includes(q)));
    }
    return temp;
  }, [posts, selectedKad, searchQuery]);

  const handleOpenForm = () => {
    resetForm();
    const now = dayjs();
    setMinTime(now);
    setDeliveryTime(now);
    setShowFormModal(true);
  };

  const handleEdit = (post) => {
    setFormData({
      kadId: post.kad_id,
      storeName: post.store_name,
      product: post.product,
      serviceFee: post.service_fee,
      price: post.price,
      delivery: post.delivery,
      delivery_at: post.delivery_at,
    });
    setEditingPostId(post.id);
    const now = dayjs();
    setMinTime(now);
    setDeliveryTime(now);
    setShowFormModal(true);
  };

  const createPost = async () => {
    const { kadId, storeName, product, serviceFee, price, delivery } = formData;
    if (!kadId || !storeName || !product || !serviceFee || !price || !delivery || !formData.delivery_at) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        kad_id: kadId,
        store_name: storeName,
        product,
        service_fee: Number(serviceFee),
        price: Number(price),
        status_id: 1,
        delivery,
        delivery_at: formData.delivery_at,
      };
      const res = await fetch(`${API}/customer/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Create failed");
      }
      await fetchPosts(statusTab);
      resetForm();
    } catch (e) {
      alert(e.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUpdate = async () => {
    if (!editingPostId) return;
    setSubmitting(true);
    try {
      const payload = {
        kad_id: formData.kadId,
        store_name: formData.storeName,
        product: formData.product,
        service_fee: Number(formData.serviceFee),
        price: Number(formData.price),
        delivery: formData.delivery,
        delivery_at: formData.delivery_at,
      };
      const res = await fetch(`${API}/customer/posts/${editingPostId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Update failed");
      }
      await fetchPosts(statusTab);
      resetForm();
      setShowConfirmUpdateModal(false);
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`${API}/customer/posts/${postId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Delete failed");
      }
      await fetchPosts(statusTab);
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingPostId) setShowConfirmUpdateModal(true);
    else createPost();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      kadId: "",
      storeName: "",
      product: "",
      serviceFee: "",
      price: "",
      delivery: "",
      delivery_at: "",
    });
    setEditingPostId(null);
    setShowFormModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <Navbar />
      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <KadDropdown kadOptions={kadOptions} selectedKad={selectedKad} setSelectedKad={setSelectedKad} />
          <div className="flex items-center gap-2">
            <div className="tabs tabs-boxed bg-white/70">
              <button
                className={`tab ${statusTab === "Available" ? "tab-active text-cyan-700" : "!text-gray-500"}`}
                onClick={() => setStatusTab("Available")}
              >
                Available
              </button>
              <button
                className={`tab ${statusTab === "Reserved" ? "tab-active text-cyan-700" : "!text-gray-500"}`}
                onClick={() => setStatusTab("Reserved")}
              >
                Reserved
              </button>
              <button
                className={`tab ${statusTab === "Closed" ? "tab-active text-cyan-700" : "!text-gray-500"}`}
                onClick={() => setStatusTab("Closed")}
              >
                Closed
              </button>
            </div>
            <button
              onClick={handleOpenForm}
              className="btn btn-primary rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              + Post
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Today Posts
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-white/60 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 font-semibold mb-2">เกิดข้อผิดพลาด</div>
            <div className="text-slate-600">{error}</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
            ไม่พบโพสต์
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showFormModal && (
        <dialog className="modal modal-open">
          <div className="modal-box p-6 rounded-3xl shadow-2xl bg-white/90">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                <span className="text-white text-xl">📝</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {editingPostId ? "Edit Post" : "Create New Post"}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-slate-800">
                  Kad Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="kadId"
                  className="select select-bordered w-full bg-white text-slate-900"
                  value={formData.kadId}
                  onChange={handleInputChange}
                >
                  <option disabled value="">
                    -- กรุณาเลือกตลาด --
                  </option>
                  {kadOptions.map((kad) => (
                    <option key={kad.id} value={kad.id}>
                      {kad.kad_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-800">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  className="input input-bordered w-full bg-white text-slate-900"
                  placeholder="กรอกชื่อร้าน"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-800">
                  Product <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product"
                  className="input input-bordered w-full bg-white text-slate-900"
                  placeholder="กรอกชื่อสินค้า"
                  value={formData.product}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    className="input input-bordered w-full bg-white text-slate-900 no-spinner"
                    placeholder="ขั้นต่ำ 1"
                    value={formData.price}
                    onChange={handleInputChange}
                    autoComplete="off"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">
                    Service Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="serviceFee"
                    className="input input-bordered w-full bg-white text-slate-900 no-spinner"
                    placeholder="ขั้นต่ำ 1"
                    value={formData.serviceFee}
                    onChange={handleInputChange}
                    autoComplete="off"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-800">
                  Delivery <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="delivery"
                  className="input input-bordered w-full bg-white text-slate-900"
                  placeholder="กรอกวิธีจัดส่ง"
                  value={formData.delivery}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-800">
                  Delivery Time <span className="text-red-500">*</span>
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="เลือกเวลา"
                    className="w-full"
                    value={deliveryTime}
                    onChange={(v) => {
                      if (v && v.isAfter(minTime)) {
                        setDeliveryTime(v);
                        setFormData((p) => ({ ...p, delivery_at: v.format("HH:mm") }));
                      }
                    }}
                    minTime={minTime}
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                    ampm={false}
                  />
                </LocalizationProvider>
              </div>

              <div className="modal-action flex justify-center gap-3 mt-6">
                <button
                  type="button"
                  className="btn px-8 py-3 rounded-xl bg-slate-100 text-slate-800"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn px-8 py-3 rounded-xl ${editingPostId ? "btn-warning" : "btn-success"} text-slate-900`}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : editingPostId ? "Update" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {showConfirmUpdateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-3xl shadow-2xl text-slate-900">
            <h3 className="text-xl font-bold text-center mb-2">ยืนยันการอัปเดตโพสต์</h3>
            <p className="text-center mb-6 text-slate-600">คุณต้องการอัปเดตโพสต์นี้หรือไม่?</p>
            <div className="modal-action flex justify-center gap-3">
              <button
                className="btn px-8 py-3 rounded-xl bg-slate-100 text-slate-800"
                onClick={() => setShowConfirmUpdateModal(false)}
                disabled={submitting}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-success px-8 py-3 rounded-xl text-slate-900"
                onClick={confirmUpdate}
                disabled={submitting}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
