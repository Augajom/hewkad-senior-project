import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/Postcard';
import KadDropdown from '../components/Kaddropdown';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import '../DaisyUI.css';


export default function Home({ }) {
  const [posts, setPosts] = useState([]);
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState(dayjs());
  const [minTime, setMinTime] = useState(dayjs()); // ✅ เวลาต่ำสุดที่เลือกได้
  const now = dayjs();



  const [orderingCount, setOrderingCount] = useState(0); // ✅ นับจำนวน orderings

  const handleNavigate = (page) => setCurrentPage(page);
  const [formData, setFormData] = useState({
    kadId: '',
    storeName: '',
    product: '',
    serviceFee: '',
    price: '',
    delivery: '',
    delivery_at: '',
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- FETCH POSTS ----------------
  const fetchPosts = async (status = 'Available') => { // ✅ เพิ่ม param status
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/customer/posts?status=${status}`, {
        credentials: 'include', // 🔑 ส่ง cookie JWT
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch posts failed:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH KAD OPTIONS ----------------
  const fetchKadOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/customer/kad', {
        credentials: 'include',
      });
      const data = await res.json();
      setKadOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch kad options failed:', err);
      setKadOptions([]);
    }
  };


  useEffect(() => {
    fetch('http://localhost:5000/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(err => console.error(err));
    fetchPosts();
    fetchKadOptions();
  },
    []);
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // ✅ Fix timezone
    return now.toISOString().slice(0, 16); // ✅ format: YYYY-MM-DDTHH:mm
  };

  // ---------------- CREATE POST ----------------
  const createPost = async () => {
    const { kadId, storeName, product, serviceFee, price, delivery } = formData;

    if (!kadId || !storeName || !product || !serviceFee || !price || !delivery || !formData.delivery_at) {
      return alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
    }

    try {
      const payload = {
        kad_id: kadId,
        store_name: storeName,
        product,
        service_fee: Number(serviceFee),
        price: Number(price),
        status_id: 1,
        delivery,
        delivery_at: formData.delivery_at, // ✅ เช่น "2025-01-12 15:45"
      };

      const res = await fetch('http://localhost:5000/customer/posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchPosts();
        resetForm(); // ✅ รีเซ็ตค่าหลังสร้าง
      } else {
        const errData = await res.json();
        alert(errData.message || 'Create failed');
      }
    } catch (err) {
      console.error('Create post failed:', err);
    }
  };

  // ---------------- EDIT POST ----------------
  const confirmUpdate = async () => {
    if (!editingPostId) return;
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

      const res = await fetch(`http://localhost:5000/customer/posts/${editingPostId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchPosts();
        resetForm();
        setShowConfirmUpdateModal(false);
      } else {
        const errData = await res.json();
        console.error('Update post error:', errData);
        alert(errData.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update post failed:', err);
    }
  };

  // ---------------- DELETE POST ----------------
  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/customer/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) await fetchPosts();
      else {
        const errData = await res.json();
        alert(errData.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete post failed:', err);
    }
  };

  // ---------------- FORM ----------------
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
    setMinTime(now);                     // ✅ จำกัดเวลาไม่ให้ย้อนหลัง
    setDeliveryTime(dayjs());            // ✅ หรือ set เป็น post.delivery_at ถ้าต้องการให้แสดงเวลาเดิม
    setShowFormModal(true);
  };
  const handleOpenForm = () => {
    resetForm();
    const now = dayjs();
    setMinTime(now);        // ✅ อัปเดตเวลาต่ำสุดเป็นเวลาปัจจุบัน
    setDeliveryTime(now);   // ✅ เวลาเริ่มต้นใน TimePicker
    setShowFormModal(true);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      kadId: '',
      storeName: '',
      product: '',
      serviceFee: '',
      price: '',
      delivery: '',
      delivery_at: '',
    });
    setEditingPostId(null);
    setShowFormModal(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingPostId) setShowConfirmUpdateModal(true);
    else createPost();
  };


  // ---------------- SEARCH ----------------
  const handleSearchSubmit = (value) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    let tempPosts = [...posts];

    // Filter by Kad
    if (selectedKad.length > 0) {
      tempPosts = tempPosts.filter(post => selectedKad.includes(post.kad_name));
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      tempPosts = tempPosts.filter(post =>
        post.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.kad_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.delivery?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(tempPosts);
  }, [posts, selectedKad, searchQuery]);


  // ---------------- FILTER ----------------


  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchSubmit={handleSearchSubmit} />
      <KadDropdown
        kadOptions={kadOptions}
        selectedKad={selectedKad}
        setSelectedKad={setSelectedKad}
      />

      <div className="p-8 container mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">Today Posts</h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <CreatePostBox onClick={handleOpenForm} />
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser} // ✅ ส่ง currentUser ลงไป
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {showFormModal && (
        <dialog className="modal modal-open">
          <div className="modal-box p-6 rounded-lg shadow-xl" style={{ backgroundColor: '#eceaeaff' }}>
            <h3 className="font-bold text-lg text-center mb-6 text-black">
              {editingPostId ? 'Edit Post' : 'Create New Post'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <select
                name="kadId"
                className="select select-bordered w-full text-black bg-white border border-black"
                value={formData.kadId}
                onChange={handleInputChange}
              >
                <option disabled value="">Kad Name</option>
                {kadOptions.map((kad) => (
                  <option key={kad.id} value={kad.id}>{kad.kad_name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Store Name"
                name="storeName"
                className="input input-bordered w-full text-black border border-black bg-white"
                value={formData.storeName}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <input
                type="text"
                placeholder="Product"
                name="product"
                className="input input-bordered w-full text-black border border-black bg-white"
                value={formData.product}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <input
                type="text"
                placeholder="Service Fee"
                name="serviceFee"
                className="input input-bordered w-full text-black border border-black bg-white"
                value={formData.serviceFee}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <input
                type="text"
                placeholder="Price"
                name="price"
                className="input input-bordered w-full text-black border border-black bg-white"
                value={formData.price}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <input
                type="text"
                placeholder="Delivery"
                name="delivery"
                className="input input-bordered w-full text-black border border-black bg-white"
                value={formData.delivery}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Select Delivery Time"
                  className=" text-black border border-black bg-white"
                  
                  value={deliveryTime}
                  onChange={(newValue) => {
                    if (newValue && newValue.isAfter(minTime)) {
                      setDeliveryTime(newValue);
                      setFormData((prev) => ({
                        ...prev,
                        delivery_at: newValue.format('HH:mm'),
                      }));
                    }
                  }}
                  minTime={minTime}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  ampm={false}
                />
              </LocalizationProvider>


              <div className="modal-action flex justify-center gap-3 mt-8">
                <button type="button" className="btn btn-ghost px-8 py-3 rounded-full bg-red-500 text-white" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-success px-8 py-3 rounded-full text-black">{editingPostId ? 'Update' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Modal confirm update */}
      {showConfirmUpdateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
            <h3 className="font-bold text-lg text-center mb-4">ยืนยันการอัปเดตโพสต์</h3>
            <p className="text-center mb-6">คุณต้องการอัปเดตโพสต์นี้หรือไม่?</p>
            <div className="modal-action flex justify-center gap-4">
              <button className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white" onClick={() => setShowConfirmUpdateModal(false)}>ยกเลิก</button>
              <button className="btn btn-success px-8 py-3 rounded-full text-black" onClick={confirmUpdate}>ยืนยัน</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
