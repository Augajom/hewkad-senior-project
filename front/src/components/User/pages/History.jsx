import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import HistoryPostCard from '../components/HistoryPostCard';
import { SlArrowDown } from "react-icons/sl";
import '../DaisyUI.css';

export default function History() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
        const statuses = ["Complete", "Reported", "Successfully"];
        const results = await Promise.all(
            statuses.map(status =>
                fetch(`http://localhost:5000/customer/history/${status}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => {
                    if (!res.ok) {
                        if (res.status === 401) throw new Error("Unauthorized: Please login");
                        throw new Error(`Failed to fetch ${status} posts`);
                    }
                    return res.json();
                })
            )
        );

        // รวมผลลัพธ์ทั้งหมด
        const combinedPosts = results.flat();

        // ✅ แปลงสถานะ Successfully → Complete
        const normalizedPosts = combinedPosts.map(post => ({
            ...post,
            status: post.status === "Successfully" ? "Complete" : post.status
        }));

        setPosts(normalizedPosts);

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
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
                        <li className='text-black'>
                            <button onClick={() => fetchPosts("Complete")}>Complete</button>
                        </li>
                        <li className='text-black'>
                            <button onClick={() => fetchPosts("Reported")}>Reported</button>
                        </li>
                        
                    </ul>
                </div>
            </div>

            <div className="p-8 container mx-auto">
                <h3 className="text-2xl font-bold text-center mb-6 text-black">History</h3>

                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : posts.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีรายการ</p>
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