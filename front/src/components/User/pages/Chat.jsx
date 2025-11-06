import React from 'react';
import ChatList from '../../Chat/ChatList'; // 👈 Import ตัวกลาง
// import UserNavbar from '../components/navbar'; // (ตัวอย่าง)

function UserChatPage() {
  // คุณอาจจะมี Navbar หรือ Layout ของ User ที่นี่
  return (
    <div>
      <ChatList />
    </div>
  );
}

export default UserChatPage;