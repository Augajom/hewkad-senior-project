import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import Navbar from '../components/navbar';
import { SlArrowDown } from "react-icons/sl";
import '../DaisyUI.css'

export default function Home({ currentUser }) {


  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    kadName: '',
    storeName: '',
    product: '',
    serviceFee: '',
    price: '',
    deliveryLocation: '',
    receivingTime: '',
  });
  const [editingPostId, setEditingPostId] = useState(null);

  // state สำหรับ modal confirm update
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // กด submit form (ยังไม่อัปเดตทันที)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingPostId !== null) {
      // เปิด modal ยืนยันการอัปเดต
      setShowConfirmUpdateModal(true);
    } else {
      // สร้างโพสต์ใหม่ทันที
      const newPost = {
        ...formData,
        id: Date.now(),
        nickname: currentUser?.nickname || 'Sinzy',
        username: currentUser?.username || 'oomsin',
      };
      setPosts((prevPosts) => [...prevPosts, newPost]);
      resetForm();
    }
  };

  // ฟังก์ชันกดยืนยันอัปเดตจริง ๆ
  const confirmUpdate = () => {
    setPosts((prev) =>
      prev.map((post) => (post.id === editingPostId ? { ...post, ...formData } : post))
    );
    setShowConfirmUpdateModal(false);
    resetForm();
  };

  // ยกเลิก modal confirm อัปเดต
  const cancelUpdate = () => {
    setShowConfirmUpdateModal(false);
  };

  const handleEdit = (post) => {
    setFormData(post);
    setEditingPostId(post.id);
    setShowFormModal(true);
  };
  
  const handleDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
  };

  const resetForm = () => {
    setFormData({
      kadName: '',
      storeName: '',
      product: '',
      serviceFee: '',
      price: '',
      deliveryLocation: '',
      receivingTime: '',
    });
    setEditingPostId(null);
    setShowFormModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mt-5 ml-6">
        <div className="dropdown">
          <div tabIndex={0} className="btn m-1 bg-white text-black" ><SlArrowDown />New lasted</div>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
            <li className='text-black'><a>New lasted</a></li>
            
          </ul>
        </div>
      </div>

      <div className="p-8 container mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">Today Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CreatePostBox onClick={() => setShowFormModal(true)} />
          {posts.map((post) => (
            <PostCard
              post={post}
              currentUser={currentUser}
              page="home"
              onEdit={(post) => handleEdit(post)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      </div>

      {/* ฟอร์มสร้าง/แก้ไขโพสต์ */}
      {showFormModal && (
        <dialog className="modal modal-open">
          <div className="modal-box p-6 rounded-lg shadow-xl" style={{ backgroundColor: '#eceaeaff' }}>
            <h3 className="font-bold text-lg text-center mb-6 text-black" >
              {editingPostId ? 'Edit Post' : 'Create New Post'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <select
                name="kadName"
                className="select select-bordered w-full text-black"
                style={{ backgroundColor: '#ffffffff' }}
                value={formData.kadName}
                onChange={handleInputChange}
              >
                <option disabled value="" >Kad Name</option>
                <option>Kad Name 1</option>
                <option>Kad Name 2</option>
              </select>

              <input type="text" placeholder="Store Name" name="storeName" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.storeName} onChange={handleInputChange} />
              <input type="text" placeholder="Product" name="product" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.product} onChange={handleInputChange} />
              <input type="text" placeholder="Service Fee" name="serviceFee" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.serviceFee} onChange={handleInputChange} />
              <input type="text" placeholder="Price" name="price" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.price} onChange={handleInputChange} />
              <input type="text" placeholder="Delivery Location" name="deliveryLocation" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.deliveryLocation} onChange={handleInputChange} />
              <input type="text" placeholder="Receiving Time" name="receivingTime" className="input input-bordered w-full text-black" style={{ backgroundColor: '#ffffffff' }} value={formData.receivingTime} onChange={handleInputChange} />

              <div className="modal-action flex justify-center gap-3 mt-8">
                <button type="button" className="btn btn-ghost px-8 py-3 rounded-full bg-red-500 text-white" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-success px-8 py-3 rounded-full text-black" >
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
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl bg-white text-black">
            <h3 className="font-bold text-lg text-center mb-4">ยืนยันการอัปเดตโพสต์</h3>
            <p className="text-center mb-6">คุณต้องการอัปเดตโพสต์นี้หรือไม่?</p>
            <div className="modal-action flex justify-center gap-4">
              <button className="btn btn-ghost px-8 py-3 rounded-full  text-red-500 bg-white" onClick={cancelUpdate}>ยกเลิก</button>
              <button className="btn btn-success px-8 py-3 rounded-full text-black" onClick={confirmUpdate}>ยืนยัน</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
