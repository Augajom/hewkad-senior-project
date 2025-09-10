// src/pages/Ordering.jsx
import React from 'react';
import Navbar from '../components/navbar';
import OrderingPostCard from '../components/OrderingPostCard'; // <--- Import the new component
import '../DaisyUI.css'

export default function Ordering({ currentUser }) {
    // mock posts
    const posts = [
        {
            id: 1,
            nickname: 'Service provider 4',
            username: '@xxxxx',
            avatar: 'https://i.pravatar.cc/150',
            kadName: 'กาดในมอ',
            storeName: 'ร้านลูกชิ้นปลาระเบิด',
            product: 'ลูกชิ้นปลา 500 ลูก',
            serviceFee: '35',
            price: '500',
            deliveryLocation: 'หอ F3',
            receivingTime: '16.00',
            status: 'Rider Received', // This post will be filtered and shown
        },
        {
            id: 2,
            nickname: 'คนส่งของ',
            username: '@rider1',
            storeName: 'ร้านชา',
            product: 'ชาเขียว',
            serviceFee: '20',
            price: '40',
            deliveryLocation: 'KU Mall',
            receivingTime: '17.00',
            status: 'Rider Received', // This post will be filtered OUT
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="p-8 container mx-auto">
                <h3 className="text-2xl font-bold text-center mb-6 text-black">รายการที่รับแล้ว</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {posts
                        .filter((post) => post.status === 'Rider Received')
                        .map((post) => (
                            <OrderingPostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}