import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import './DaisyUI.css'

const initialOrders = [
  {
    id: 1,
    profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "ก้วย",
    username: "@qaevw.n",
    location: "กาดคชพล",
    shopName: "ร้านลูกชิ้นปลาระเบิด",
    item: "ลูกชิ้นปลา 500 ลูก",
    deliveryTime: "16.00",
    price: 500,
    fee: 20,
    status: "Available",
  },
  {
    id: 2,
    profileImg: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "พลอย",
    username: "@ploy123",
    location: "กาดสวนแก้ว",
    shopName: "ร้านข้าวซอยแม่คำ",
    item: "ข้าวซอยไก่ 2 ที่",
    deliveryTime: "12.00",
    price: 150,
    fee: 20,
    status: "Available",
  },
];

const FoodCard = ({ order, onRequestConfirm }) => (
  <div className="w-64 p-4 bg-white rounded-xl shadow-md border">
    <div className="flex items-center mb-3">
      <img src={order.profileImg} alt="profile" className="w-10 h-10 rounded-full object-cover mr-3" />
      <div>
        <p className="text-sm font-bold text-black">{order.name}</p>
        <p className="text-xs text-gray-500">{order.username}</p>
      </div>
    </div>
    <div className="text-sm text-black mb-3 space-y-1">
      <p><strong>สถานที่:</strong> {order.location}</p>
      <p><strong>ร้าน:</strong> {order.shopName}</p>
      <p><strong>สินค้า:</strong> {order.item}</p>
      <p><strong>ราคา:</strong> {order.price} ฿</p>
    </div>
    <div className="flex justify-between items-center">
      <span className={`text-xs text-white px-2 py-1 rounded ${order.status === "Available" ? "bg-green-500" : "bg-blue-400"}`}>
        {order.status}
      </span>
      <button
        onClick={onRequestConfirm}
        className="px-3 py-1 text-xs text-white bg-red-600 rounded"
      >
        HEW
      </button>
    </div>
    <div className="text-xl font-bold text-red-600 mt-2">{order.fee} ฿</div>
  </div>
);

const FoodCardList = ({ onConfirmOrder }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleRequestConfirm = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const newOrder = { ...selectedOrder, status: "Waiting", proof: null };

    onConfirmOrder(newOrder); // ส่ง order ไป App (Ordering)

    setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
    setModalVisible(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {orders.map((order) => (
          <FoodCard
            key={order.id}
            order={order}
            onRequestConfirm={() => handleRequestConfirm(order)}
          />
        ))}

        {orders.length === 0 && (
          <p className="text-gray-500 w-full text-center mt-10">ไม่มีออเดอร์เหลืออยู่</p>
        )}
      </div>

      <ConfirmModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        selectedOrder={selectedOrder}
      />
    </>
  );
};

export default FoodCardList;
