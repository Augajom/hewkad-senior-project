import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar.jsx';
import '../DaisyUI.css';

const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/service/history', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setHistoryList(data))
      .catch(err => console.error(err));
  }, []);

  // ฟังก์ชันช่วยกำหนดสีตาม status
  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'Complete':
        return 'font-extrabold text-green-500';
      case 'Reported':
        return 'font-extrabold text-red-500';
      default:
        return '';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Complete':
        return 'font-extrabold text-green-500';
      case 'Waiting User Payment':
        return 'font-extrabold text-yellow-500';
      case 'Denied':
        return 'font-extrabold text-red-500';
      default:
        return 'font-extrabold text-red-500 ';
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar currentPage="history" />
      <div className="p-4">
        <h2 className="text-lg text-black font-bold mb-4">ประวัติการสั่งซื้อ</h2>
        <table className="w-full text-sm text-center text-black">
          <thead>
            <tr className="border-b">
              <th>Store Name</th>
              <th>Product</th>
              <th>Total Price</th>
              <th>Status Order</th>
              <th>Status Payment</th>
              <th>Customer</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {historyList.length > 0 ? (
              historyList.map(order => (
                <tr key={order.order_id} className="border-b">
                  <td>{order.store_name || '-'}</td>
                  <td>{order.product || '-'}</td>
                  <td>{(order.order_price || 0) + (order.order_service_fee || 0)} Baht</td>
                  <td className={getOrderStatusClass(order.order_status)}>
                    {order.order_status || '-'}
                  </td>
                  <td className={getPaymentStatusClass(order.status_payment)}>
                    {order.status_payment || 'Waiting '}
                  </td>
                  <td>
                    {order.customer_name || '-'}
                    <div className="text-gray-400 text-xs">{order.customer_username || '-'}</div>
                  </td>
                  <td>{order.completed_at ? new Date(order.completed_at).toLocaleString() : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-gray-500 text-center py-10">
                  ไม่มีประวัติการสั่งซื้อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;
