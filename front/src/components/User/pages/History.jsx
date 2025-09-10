import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { SlArrowDown } from "react-icons/sl";
import HistoryPostCard from '../components/HistoryPostCard'; // Import the new HistoryPostCard component
import '../DaisyUI.css'


export default function History({ currentUser }) {
    // mock data ตัวอย่างโพสต์ในสถานะ Complete
    
    const mockCompletedPosts = [
        {
            id: 1,
            avatar: 'https://i.pravatar.cc/150?img=10',
            nickname: 'Maximus',
            username: '@maximus123',
            serviceFee: 50,
            deliveryLocation: 'บางซื่อ กรุงเทพฯ',
            storeName: 'ร้านข้าวแกงเจ๊แดง',
            product: 'ข้าวหมูทอด',
            price: 80,
            kadName: 'ตลาดบางซื่อ',
            receivingTime: '14:30 น.',
            proofImageUrl: 'https://via.placeholder.com/400x300?text=Proof+1',
            status: 'Complete',
        },
        {
            id: 2,
            avatar: 'https://i.pravatar.cc/150?img=20',
            nickname: 'Jane',
            username: '@jane_doe',
            serviceFee: 60,
            deliveryLocation: 'ลาดพร้าว กรุงเทพฯ',
            storeName: 'ร้านกาแฟ Beans',
            product: 'กาแฟลาเต้',
            price: 120,
            kadName: 'ตลาดลาดพร้าว',
            receivingTime: '16:00 น.',
            proofImageUrl: 'https://via.placeholder.com/400x300?text=Proof+2',
            status: 'Reported',
        },
    ];


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
                <h3 className="text-2xl font-bold text-center mb-6 text-black">History</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {mockCompletedPosts.length === 0 ? (
                        <p className="text-center text-gray-500 col-span-full">ยังไม่มีรายการที่เสร็จสมบูรณ์</p>
                    ) : (
                        mockCompletedPosts.map(post => (
                            <HistoryPostCard key={post.id} post={post} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
