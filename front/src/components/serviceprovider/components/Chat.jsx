import React from 'react';
import ChatList from '../../Chat/ChatList'; // 👈 Import ตัวกลาง
// import RiderNavbar from './navbar'; // (ตัวอย่าง)

function RiderChatPage() {
  // คุณอาจจะมี Navbar หรือ Layout ของ Rider ที่นี่
  return (
    <div>
      {/* <RiderNavbar /> */}
      <ChatList /> {/* 👈 ใช้งาน Component กลาง */}
    </div>
  );
}

export default RiderChatPage;