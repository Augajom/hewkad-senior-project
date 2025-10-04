import React from "react";
import './DaisyUI.css'

const HistoryPage = ({ historyList }) => {
  return (
    <div>
      <h2 className="text-lg text-black font-bold mb-4">ประวัติการสั่งซื้อ</h2>
      <table className="w-full text-sm text-left text-black">
        <thead>
          <tr className="border-b">
            <th className="py-2">Store Name</th>
            <th>Product</th>
            <th>Total Price</th>
            <th>Status Payment</th>
            <th>Status Order</th>
            <th>Date</th>
            <th>Customer</th>
          </tr>
        </thead>
        <tbody>
          {historyList.map((order) => (
            <tr key={order.id} className="border-b">
              <td>{order.shopName}</td>
              <td>{order.item}</td>
              <td className="font-bold">{order.price + order.fee} Baht</td>
              <td className="text-green-600 font-semibold">Complete</td>
              <td className="text-green-600 font-semibold">Complete</td>
              <td>22 / 02 / 2025</td>
              <td>
                {order.name}
                <div className="text-gray-400 text-xs">{order.username}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
