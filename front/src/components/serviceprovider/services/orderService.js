
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

/**
 * ดึงรายการออเดอร์จาก API จริง
 * @param {string} status เช่น "Available" | "Waiting" | "Ordering"
 */
export async function getOrders(status = "Available,Rider Received,Ordering,Order Received,Reported") {
  const url = `${API_BASE}/service/order?status=${encodeURIComponent(status)}`;
  

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", 
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {

    const text = await res.text().catch(() => "");
    const msg = text || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
