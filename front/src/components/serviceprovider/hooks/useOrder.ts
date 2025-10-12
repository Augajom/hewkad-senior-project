// src/hooks/useOrders.js
import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";

export function useOrders(status = "Available") {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError("");
        const data = await getOrders(status); 
        if (alive) setOrders(data);
      } catch (e) {
        if (alive) {
          setOrders([]);
          setError(e?.message || "Failed to load orders");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, [status]);

  return { orders, loading, error, setOrders };
}
