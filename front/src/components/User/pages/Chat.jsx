// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import serviceNavbar from "../../serviceprovider/components/navbar";
// import customerNavbar from "../components/navbar";

// const socket = io("http://localhost:3001");

// export default function Chat() {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [username, setUsername] = useState("");
//   const [role, setRole] = useState(""); // state สำหรับ role

//   const myId = socket.id;

//   useEffect(() => {
//     // ตรวจสอบ path ว่าเป็น user หรือ service
//     const path = window.location.pathname.toLowerCase();
//     if (path.includes("/user")) {
//       setRole("Customer");
//     } else if (path.includes("/service")) {
//       setRole("Service Provider");
//     }

//     // ดึง fullname จาก API
//     const fetchUsername = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/customer/name", {
//           credentials: "include",
//         });
//         if (!res.ok) throw new Error("Failed to fetch username");
//         const data = await res.json();
//         setUsername(data.fullName || "Anonymous");
//       } catch (err) {
//         console.error(err);
//         setUsername("Anonymous");
//       }
//     };

//     fetchUsername();

//     socket.on("receiveMessage", (data) => {
//       setChat((prev) => [...prev, data]);
//     });

//     return () => socket.off("receiveMessage");
//   }, []);

//   const sendMessage = () => {
//     if (message.trim()) {
//       const msgData = { id: socket.id, username, text: message };
//       socket.emit("sendMessage", msgData);
//       setMessage("");
//     }
//   };

//   const Navbar = role === "Customer" ? customerNavbar : serviceNavbar;

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />

//       <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md mt-4">
//         <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
//           💬 Live Chat | {role} | {username}
//         </h2>

//         <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 flex flex-col gap-2 mb-4 bg-gray-50">
//           {chat.map((msg, i) => {
//             const isMe = msg.id === socket.id;
//             return (
//               <div
//                 key={i}
//                 className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`px-4 py-2 rounded-lg max-w-xs break-words shadow
//                     ${isMe ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
//                 >
//                   {!isMe && (
//                     <div className="text-sm font-semibold mb-1">{msg.username}</div>
//                   )}
//                   <div>{msg.text}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             placeholder="Type a message..."
//             className="input flex-1 border border-gray-300 bg-white text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react'

function Chat() {
  return (
    <div>Chat</div>
  )
}

export default Chat