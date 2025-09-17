import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/Postcard';
import Navbar from '../components/navbar';
import KadDropdown from '../components/Kaddropdown';
import '../DaisyUI.css';

export default function Home({ currentUser }) {
  const navigate = useNavigate();

  const [showFormModal, setShowFormModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState([]);
  const [formData, setFormData] = useState({
    kadId: '',
    storeName: '',
    product: '',
    serviceFee: '',
    price: '',
    delivery: '',
    delivery_at: '',
  });
  const [editingPostId, setEditingPostId] = useState(null);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);

  // --- FETCH POSTS ---
  const fetchPosts = async () => {
    try {
      const userIdParam = currentUser?.id ? `?userId=${currentUser.id}` : '';
      const res = await fetch(`http://localhost:5000/home/posts${userIdParam}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch posts failed:', err);
      setPosts([]);
    }
  };

  // --- FETCH KAD OPTIONS ---
  const fetchKadOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/home/kad', {
        method: 'GET',
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
  const fetchUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/auth/me', {
        method: 'GET',
        credentials: 'include', // ต้อง include cookie JWT
      });
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error('Fetch current user failed:', err);
      setCurrentUser(null);
    }
  };

  fetchUser();
  fetchPosts();
  fetchKadOptions();
}, []);

  // --- FILTER POSTS ---
  const filteredPosts = selectedKad.length > 0
    ? posts.filter((post) => selectedKad.includes(post.kad_name))
    : posts;

  // --- CREATE POST ---
const createPost = async () => {
  if (!formData.kadId) {
    alert('กรุณาเลือก Kad');
    return;
  }
  try {
    const payload = {};

    // แปลง formData เป็น backend keys
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== '') {
        let backendKey;
        if (key === 'kadId') backendKey = 'kad_id';
        else if (key === 'storeName') backendKey = 'store_name';
        else if (key === 'serviceFee') backendKey = 'service_fee';
        else backendKey = key;

        payload[backendKey] = (key === 'serviceFee' || key === 'price')
          ? Number(formData[key])
          : formData[key];
      }
    });
    // เพิ่ม status_id ถ้าต้องการ
    payload.status_id = 1;

    const res = await fetch('http://localhost:5000/home/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchPosts();
      resetForm();
    } else {
      const errData = await res.json();
      console.error('Create post error:', errData);
      alert('สร้างโพสต์ล้มเหลว');
    }
  } catch (err) {
    console.error('Create post failed:', err);
    alert('เกิดข้อผิดพลาดขณะสร้างโพสต์');
  }
};

  // --- UPDATE POST ---
  const confirmUpdate = async () => {
    if (!editingPostId) return;

    try {
      const updatePayload = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          // แปลงชื่อฟิลด์เป็น snake_case ตามฐานข้อมูล
          let backendKey;
          if (key === 'kadId') backendKey = 'kad_id';
          else if (key === 'storeName') backendKey = 'store_name';
          else if (key === 'serviceFee') backendKey = 'service_fee';
          else backendKey = key;

          updatePayload[backendKey] = (key === 'serviceFee' || key === 'price')
            ? Number(formData[key])
            : formData[key];
        }
      });

      const res = await fetch(`http://localhost:5000/home/edit/${editingPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        await fetchPosts();
        resetForm();
        setShowConfirmUpdateModal(false);
      } else {
        const errData = await res.json();
        console.error('Update post error:', errData);
      }
    } catch (err) {
      console.error('Update post failed:', err);
    }
  };

  const cancelUpdate = () => setShowConfirmUpdateModal(false);

  // --- DELETE POST ---
  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/home/delete/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) await fetchPosts();
    } catch (err) {
      console.error('Delete post failed:', err);
    }
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
    if (editingPostId !== null) setShowConfirmUpdateModal(true);
    else createPost();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <KadDropdown
        kadOptions={kadOptions}
        selectedKad={selectedKad}
        setSelectedKad={setSelectedKad}
      />

      <div className="p-8 container mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">Today Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CreatePostBox onClick={() => setShowFormModal(true)} />
          {Array.isArray(filteredPosts) && filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              page="home"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* ฟอร์มสร้าง/แก้ไขโพสต์ */}
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
                  <option key={kad.id} value={kad.id}>
                    {kad.kad_name}
                  </option>
                ))}
              </select>

              <input type="text" placeholder="Store Name" name="storeName" className="input input-bordered w-full text-black border border-black bg-white " value={formData.storeName} onChange={handleInputChange} />
              <input type="text" placeholder="Product" name="product" className="input input-bordered w-full text-black border border-black bg-white " value={formData.product} onChange={handleInputChange} />
              <input type="text" placeholder="Service Fee" name="serviceFee" className="input input-bordered w-full text-black border border-black bg-white " value={formData.serviceFee} onChange={handleInputChange} />
              <input type="text" placeholder="Price" name="price" className="input input-bordered w-full text-black border border-black bg-white " value={formData.price} onChange={handleInputChange} />
              <input type="text" placeholder="Delivery Location" name="delivery" className="input input-bordered w-full text-black border border-black bg-white" value={formData.delivery} onChange={handleInputChange} />
              <input type="text" placeholder="Receiving Time" name="delivery_at" className="input input-bordered w-full text-black border border-black bg-white" value={formData.delivery_at} onChange={handleInputChange} />

              <div className="modal-action flex justify-center gap-3 mt-8">
                <button type="button" className="btn btn-ghost px-8 py-3 rounded-full bg-red-500 text-white" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-success px-8 py-3 rounded-full text-black">
                  {editingPostId ? 'Update' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Modal ยืนยันอัปเดต */}
      {showConfirmUpdateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
            <h3 className="font-bold text-lg text-center mb-4">ยืนยันการอัปเดตโพสต์</h3>
            <p className="text-center mb-6">คุณต้องการอัปเดตโพสต์นี้หรือไม่?</p>
            <div className="modal-action flex justify-center gap-4">
              <button className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white" onClick={cancelUpdate}>ยกเลิก</button>
              <button className="btn btn-success px-8 py-3 rounded-full text-black" onClick={confirmUpdate}>ยืนยัน</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
