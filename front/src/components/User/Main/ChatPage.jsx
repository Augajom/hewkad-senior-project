import React, { useState } from "react";
import '../DaisyUI.css'

const ChatPage = ({ historyList, orderingList }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  // รวมรายชื่อทั้งหมดจาก History + Ordering
  const customers = [...orderingList, ...historyList];

  return (
    <div className="flex h-[calc(100vh-150px)] bg-gray-50">
      {/* Sidebar รายชื่อลูกค้า */}
      <div className="w-1/3 border-r p-4 space-y-3 overflow-y-auto">
        {customers.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer shadow-sm ${
              selectedUser?.id === c.id ? "bg-gray-200" : "bg-white"
            }`}
            onClick={() => setSelectedUser(c)}
          >
            <img
              src={c.profileImg}
              alt={c.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-black">{c.name}</p>
              <p className="text-sm text-gray-500">{c.username}</p>
              <p className="text-xs text-gray-400 truncate">{c.item}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-100 px-4 py-2 shadow">
              <div className="flex items-center gap-3 text-black">
                <img
                  src={selectedUser.profileImg}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.item}</p>
                </div>
              </div>
              <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                REPORT
              </button>
            </div>

            {/* Messages (พื้นที่แชทตรงกลาง) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-black">
              
            </div>

            {/* Input Box (fix bottom) */}
            <div className="border-t p-3 flex gap-2 bg-white text-black">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
              />
              <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            เลือกผู้ใช้จากด้านซ้ายเพื่อเริ่มแชท
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
