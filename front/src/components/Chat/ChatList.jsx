import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Link, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

// 1. 🎨 Import hook และ Navbar
import { useAuth } from '../../hooks/useAuth';
import UserNavbar from '../User/components/navbar'; 
import RiderNavbar from '../serviceprovider/components/navbar';
import { CiSearch } from "react-icons/ci";
import { User } from "lucide-react";
import { resolveImg } from '../../utils/resolveImg';

// 🎨 (Optional) เพิ่ม relativeTime
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


function ChatList() {
  const { user, loading: loadingUser } = useAuth(); 
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [search, setSearch] = useState(""); // 🎨 State สำหรับ Search

  // 2. Effect สำหรับดึงรายการแชท (เหมือนเดิม)
  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      setLoadingChats(false);
      return; 
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.id),
      orderBy('lastTimestamp', 'desc') // 👈 เรียงตามข้อความล่าสุด
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatRooms = [];
      querySnapshot.forEach((doc) => {
        chatRooms.push({ id: doc.id, ...doc.data() });
      });
      setChats(chatRooms);
      setLoadingChats(false);
    }, (error) => {
      console.error("Firestore snapshot error: ", error);
      setLoadingChats(false);
    });

    return () => unsubscribe();

  }, [user, loadingUser]); 

  // 3. 🎨 Filter รายการแชทตามชื่อที่ค้นหา
  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();

    return chats.filter(chat => {
      // หาชื่ออีกฝ่าย
      const otherPersonName = (chat.customer_id === user.id ? chat.rider_name : chat.customer_name) || "";
      return otherPersonName.toLowerCase().includes(q);
    });
  }, [chats, search, user]);

  const location = useLocation();
  const isRiderContext = location.pathname.startsWith('/service');
                  
  const NavbarComponent = isRiderContext ? RiderNavbar : UserNavbar;
  const chatBasePath = isRiderContext ? '/service/chat' : '/user/chat';
  

  // 4. 🎨 UI ที่ปรับปรุงใหม่ทั้งหมด
  return (
    // 🎨 Layout หลัก (เหมือน Ordering.jsx)
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      <NavbarComponent onSearchSubmit={setSearch} />

      {/* 🎨 2. Header ของแชท (สไตล์เดียวกับ Filter bar) */}
      <header className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Your Chats</h1>
          <div className="w-full md:w-72">
            <div className="relative">
              <CiSearch className="absolute size-5 left-4 top-5 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search chats..."
                className="input input-bordered border border-1 border-gray-400 w-full bg-white/90 text-slate-900 rounded-xl pl-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 🎨 3. พื้นที่แสดงรายการแชท */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-3">

          {/* สถานะ Loading / ไม่มี User */}
          {(loadingUser || loadingChats) && (
            <div className="text-center text-slate-500 py-10">
              Loading chats...
            </div>
          )}

          {!loadingUser && !user && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
              Please log in to see your chats.
            </div>
          )}

          {/* สถานะ ไม่มีแชท */}
          {!loadingUser && user && filteredChats.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
              {search ? 'No chats found matching your search.' : 'You have no chats yet.'}
            </div>
          )}

          {/* 🎨 4. แสดงรายการแชท (Card) */}
          {!loadingUser && user && filteredChats.map((chat) => {
            const isCustomer = chat.customer_id === user.id;
            const otherPersonName = isCustomer ? chat.rider_name : chat.customer_name;
            const otherPersonAvatar = isCustomer ? chat.rider_avatar : chat.customer_avatar;
            const avatarSrc = resolveImg(otherPersonAvatar);
            const lastTime = chat.lastTimestamp ? dayjs(chat.lastTimestamp.toDate()).fromNow() : '';

            return (
              // 🎨 ใช้ Card ที่เป็น Link (daisyUI)
              <Link 
                key={chat.id} 
                to={`${chatBasePath}/${chat.id}`}
                className="card w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-4 
                           hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="avatar placeholder flex-shrink-0">
                    <div className="w-12 rounded-full bg-slate-200">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={otherPersonName} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h2 className="card-title text-base font-bold text-slate-900 truncate">
                        {otherPersonName}
                      </h2>
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                        {lastTime}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {chat.lastMessage || '...'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
          
        </div>
      </main>
    </div>
  );
}

export default ChatList;