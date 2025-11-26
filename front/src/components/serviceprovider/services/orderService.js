// orderService.js
import axios from 'axios';

const API_BASE = import.meta.env?.VITE_API_URL || "https://hewkad.com:2053";

/**
 * ดึงรายการออเดอร์จาก API จริง
 * @param {string} status เช่น "Available" | "Waiting" | "Ordering"
 */
export async function getOrders(status = "Available,Rider Received,Ordering,Order Received,Reported") {
  const url = `${API_BASE}/service/order?status=${encodeURIComponent(status)}`;
  
  try {
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        "Accept": "application/json",
      },
    });
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error in getOrders:", error);
    throw error;
  }
}