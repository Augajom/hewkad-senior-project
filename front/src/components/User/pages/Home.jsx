import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/Postcard';
import Navbar from '../components/navbar';
import { SlArrowDown } from "react-icons/sl";
import KadDropdown from '../components/Kaddropdown';
import '../DaisyUI.css'

export default function Home({ currentUser }) {
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [profile, setProflies] = useState([]);
  const [kadOptions, setKadOptions] = useState([]);
  const [selectedKad, setSelectedKad] = useState('');
  const [formData, setFormData] = useState({
    kadId: '', // 🔹 เก็บ id ของตลาด
    storeName: '',
    product: '',
    serviceFee: '',
    price: '',
    delivery: '',
    delivery_at: '',
  });
  const [editingPostId, setEditingPostId] = useState(null);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
  const filterPostsByKad = (kadName) => {
    if (!kadName) {
      fetchPosts(); // ถ้าไม่เลือก ก็แสดงทุกโพสต์
      return;
    }
    const filtered = posts.filter(post => post.kad_name === kadName);
    setPosts(filtered);
  };

  // ดึงข้อมูลโพสต์จาก backend
  useEffect(() => {
    fetchPosts();
    fetchKadOptions();
  }, []);
  // กรองโพสต์ตาม selectedKad
  const filteredPosts = selectedKad.length > 0
    ? posts.filter(post => selectedKad.includes(post.kad_name))
    : posts;


  const fetchKadOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/customer/kad');
      const data = await res.json();
      setKadOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch Kad options', err);
      setKadOptions([]);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/customer/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch posts', err);
      setPosts([]);
    }
  };

  const createPost = async () => {
    try {
      const payload = {
        kad_id: Number(formData.kadId), // 🔹 ส่ง id ให้ backend
        store_name: formData.storeName,
        product: formData.product,
        service_fee: Number(formData.serviceFee),
        price: Number(formData.price),
        user_id: currentUser?.id || 7,
        profile_id: currentUser?.profileId || 7,
        status_id: 1,
        delivery: formData.delivery,
        delivery_at: formData.delivery_at
      };
      console.log("Sending payload to backend:", payload); // 🔹 debug
      const res = await fetch('http://localhost:5000/customer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchPosts();
        resetForm();
      } else {
        const errData = await res.json();
        console.error("Backend response error:", errData); // 🔹 debug
      }
    } catch (err) {
      console.error('Create post failed', err);
    }
  };

  const confirmUpdate = async () => {
    try {
      const updatePayload = {};

      if (formData.kadId) updatePayload.kad_id = Number(formData.kadId);
      if (formData.serviceFee) updatePayload.service_fee = Number(formData.serviceFee);
      if (formData.price) updatePayload.price = Number(formData.price);
      if (formData.storeName) updatePayload.store_name = formData.storeName;
      if (formData.product) updatePayload.product = formData.product;
      if (formData.delivery) updatePayload.delivery = formData.delivery;
      if (formData.delivery_at) updatePayload.delivery_at = formData.delivery_at;

      const res = await fetch(`http://localhost:5000/customer/edit/${editingPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        await fetchPosts();
        resetForm();
        setShowConfirmUpdateModal(false);
      } else {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
      }
    } catch (err) {
      console.error('Update post failed', err);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingPostId !== null) {
      setShowConfirmUpdateModal(true);
    } else {
      createPost();
    }
  };

  const cancelUpdate = () => setShowConfirmUpdateModal(false);

  const handleEdit = (post) => {
    setFormData({
      kadId: Number(post.kad_id), // ✅ ตรงกับ dropdown
      storeName: post.store_name,
      product: post.product,
      serviceFee: post.service_fee,
      price: post.price,
      delivery: post.delivery,
      delivery_at: post.delivery_at
    });
    setEditingPostId(post.id);
    setShowFormModal(true);
  };

  // ลบโพสต์
  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/customer/delete/${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (err) {
      console.error('Delete post failed', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      kadId: '',       // 🔹 reset kadId
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
        // ใน render
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
              {/* ... other input fields */}
              <input type="text" placeholder="Store Name" name="storeName" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.storeName} onChange={handleInputChange} />
              <input type="text" placeholder="Product" name="product" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.product} onChange={handleInputChange} />
              <input type="text" placeholder="Service Fee" name="serviceFee" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.serviceFee} onChange={handleInputChange} />
              <input type="text" placeholder="Price" name="price" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.price} onChange={handleInputChange} />
              <input type="text" placeholder="Delivery Location" name="delivery" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.delivery} onChange={handleInputChange} />
              <input type="text" placeholder="Receiving Time" name="delivery_at" className="input input-bordered w-full text-black border border-black" style={{ backgroundColor: '#ffffffff' }} value={formData.delivery_at} onChange={handleInputChange} />

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
