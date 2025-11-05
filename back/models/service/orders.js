// models/orders.js
const db = require('../../config/db');

const Orders = {
  // สร้าง order ใหม่
  create: ({ post_id, rider_id, status_id, order_price, order_service_fee, delivery_address, delivery_time }) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO orders 
          (post_id, rider_id, status_id, order_price, order_service_fee, delivery_address, delivery_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_id, rider_id, status_id, order_price, order_service_fee, delivery_address, delivery_time],
        (err, result) => {
          if (err) return reject(err);
          resolve({ id: result.insertId, post_id, rider_id, status_id, order_price, order_service_fee, delivery_address, delivery_time });
        }
      );
    });
  },

  // อัปเดตสถานะ order
  updateStatus: (order_id, status_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE orders SET status_id = ? WHERE id = ?`,
        [status_id, order_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // ดึง order ของ SP
  getByRider: (rider_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT o.*, p.proof_url
       FROM orders o
       LEFT JOIN posts p ON o.post_id = p.id
       WHERE o.rider_id = ?
       ORDER BY o.ordered_at DESC`,
      [rider_id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}
};

module.exports = Orders;
