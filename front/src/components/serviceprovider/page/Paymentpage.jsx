import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar.jsx';
import '../DaisyUI.css';

const HistoryPage = () => {
    const [historyList, setHistoryList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);

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
            case 'Successfully':
                return 'font-extrabold text-green-500';
            case 'Reported':
                return 'font-extrabold text-red-500';
            default:
                return '';
        }
    };

    const getPaymentStatusClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'font-extrabold text-green-500';
            case 'Waiting User Payment':
                return 'font-extrabold text-yellow-500';
            case 'Denied':
                return 'font-extrabold text-red-500';
            default:
                return 'font-extrabold text-red-500';
        }
    };

    const openSlipModal = (url) => {
        setSelectedSlip(url);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSlip(null);
        setModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar currentPage="history" />
            <div className="p-4">
                <h2 className="text-lg text-black font-bold mb-4">Order history</h2>
                <table className="w-full text-sm text-center text-black">
                    <thead>
                        <tr className="border-b">
                            <th>Store Name</th>
                            <th>Product</th>
                            <th>Total Price</th>
                            <th>Status Order</th>
                            <th>Status Payment</th>
                            <th>Customer</th>
                            <th>Slip</th>
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
                                        {order.status_payment || 'waiting'}
                                    </td>
                                    <td>
                                        {order.customer_name || '-'}
                                        <div className="text-gray-400 text-xs">{order.customer_username || '-'}</div>
                                    </td>
                                    <td>
                                        {order.slip_filename ? (
                                            <button
                                                className="text-blue-600 underline decoration-2 px-2 py-1 cursor-pointer"
                                                onClick={() =>
                                                    openSlipModal(`http://localhost:5000/Files/Payment/${order.slip_filename}`)
                                                }
                                            >
                                                View Slip
                                            </button>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-gray-500 text-center py-10">
                                    No order history.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg max-w-xl w-full relative">
                        <button
                            className="absolute top-2 right-2 text-red-500 font-bold text-xl cursor-pointer"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        {selectedSlip && (
                            <img
                                src={selectedSlip}
                                alt="Slip"
                                className="max-h-[80vh] w-auto mx-auto"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
