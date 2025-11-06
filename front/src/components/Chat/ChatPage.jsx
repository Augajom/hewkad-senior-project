// src/components/Chat/ChatPage.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';

// 1. 🎨 Import hook และ Navbar (อ้างอิงจาก Ordering.jsx)
import { useAuth } from '../../hooks/useAuth'; // 👈 ตรวจสอบ Path
import UserNavbar from '../User/components/navbar';
import RiderNavbar from '../serviceprovider/components/navbar';
import dayjs from 'dayjs'; // 👈 (ถ้ายังไม่มี) npm install dayjs
import { IoSend } from "react-icons/io5"; // 👈 Icon
import { User } from 'lucide-react'; // 👈 1. Import <User> icon
import { resolveImg } from '../../utils/resolveImg';

function ChatPage() {
  const { chatId } = useParams(); 
  const { user, loading: loadingUser } = useAuth(); 
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null); // 🎨 State สำหรับเก็บชื่อห้อง
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref สำหรับ Auto-scroll

  // 2. 🎨 Effect สำหรับดึงข้อมูลห้องแชท (เพื่อเอาชื่ออีกฝ่ายมาแสดง)
  useEffect(() => {
    if (!chatId) return;
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        setChatInfo(doc.data());
      } else {
        console.error("Chat room not found!");
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  // 3. Effect สำหรับดึงข้อความ (เหมือนเดิม แต่เช็ก loadingUser)
  useEffect(() => {
    if (!chatId || !user) return; // 👈 รอ user โหลดเสร็จ

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc') 
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId, user]); // 👈 ทำงานใหม่เมื่อ user พร้อม

  // 4. Effect สำหรับ Auto-scroll (เหมือนเดิม)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. ฟังก์ชันส่งข้อความ (เหมือนเดิม)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user) return;

    try {
      const messagesColRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesColRef, {
        text: newMessage,
        sender_id: user.id,
        timestamp: serverTimestamp()
      });
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: newMessage,
        lastTimestamp: serverTimestamp()
      });
      setNewMessage(""); 
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // 6. 🎨 Logic สำหรับแสดงชื่ออีกฝ่าย
  const otherPersonName = useMemo(() => {
    if (!chatInfo || !user) return "Loading...";
    return chatInfo.customer_id === user.id ? chatInfo.rider_name : chatInfo.customer_name;
  }, [chatInfo, user]);

  //
  // 👇✅ เพิ่มโค้ดบล็อกนี้เข้ามา (ที่คุณลืมคัดลอกมา) ✅👇
  //
  const otherPersonAvatar = useMemo(() => {
    if (!chatInfo || !user) return null;
    // เช็กว่า user ID ของฉัน ตรงกับ customer_id ในห้องแชทหรือไม่
    // ถ้าใช่ -> แสดงรูป rider
    // ถ้าไม่ใช่ -> แสดงรูป customer
    return chatInfo.customer_id === user.id ? chatInfo.rider_avatar : chatInfo.customer_avatar;
  }, [chatInfo, user]);

  const avatarSrc = resolveImg(otherPersonAvatar);

  const location = useLocation();
  const isRiderContext = location.pathname.startsWith('/service/chat'); // 👈 ตรวจสอบ Path
                  
  const NavbarComponent = isRiderContext ? RiderNavbar : UserNavbar;

  
  // 7. 🎨 UI ที่ปรับปรุงใหม่ทั้งหมด
  return (
    // 🎨 ใช้ Layout หลักเหมือน Ordering.jsx แต่ปรับเป็น flex column
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      <NavbarComponent />

      {/* 🎨 2. Header ของแชท (สไตล์เดียวกับ Filter bar) */}
      <header className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Avatar Placeholder (daisyUI) */}
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              {avatarSrc ? (
                <img src={avatarSrc} alt={otherPersonName} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{otherPersonName}</h1>
        </div>
      </header>

      {/* 🎨 3. พื้นที่แสดงข้อความ (ใช้ flex-1 ให้เต็มพื้นที่) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* สถานะ Loading / ไม่มีข้อความ */}
          {loadingUser && <div className="text-center text-slate-500">Loading user...</div>}
          {!loadingUser && messages.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              ยังไม่มีข้อความ...
            </div>
          )}

          {/* 🎨 4. แสดงข้อความ (ใช้ daisyUI Chat) */}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}>
                <div className="chat-header text-xs text-slate-500 mb-1 opacity-80">
                  {msg.timestamp ? dayjs(msg.timestamp.toDate()).format('h:mm A') : ''}
                </div>
                <div 
                  className={`chat-bubble ${
                    isMine ? 'chat-bubble-primary text-white' : 'bg-white text-slate-900 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {/* 🎨 Div สำหรับ Auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 🎨 5. ฟอร์มส่งข้อความ (สไตล์เดียวกับ Header/Filter) */}
      <form 
        onSubmit={handleSendMessage} 
        className="sticky bottom-0 z-40 bg-white/70 backdrop-blur-xl border-t border-slate-200/50"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์ข้อความ…"
            className="input input-bordered w-full flex-1 bg-white rounded-xl text-slate-900 shadow-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user || loadingUser}
          />
          <button 
            type="submit" 
            className="btn btn-primary rounded-xl" 
            disabled={!user || loadingUser || newMessage.trim() === ''}
          >
            <IoSend className="size-5" />
          </button>
        </div>
      </form>

    </div>
  );
}

export default ChatPage;