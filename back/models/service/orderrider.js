// models/orderrider.js
const db = require('../../config/db');

const OrderRider = {
  // ดึง order ของ rider ปัจจุบันที่ status = 2,3,4
  getByRider: (rider_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
           o.*, 
           p.kad_id, k.kad_name, p.store_name, p.product, 
           p.service_fee AS post_service_fee, p.price AS post_price, p.user_id AS post_user_id, 
           u.username, pr.name AS nickname, pr.picture AS avatar, 
           p.delivery, p.delivery_at, p.created_at AS post_created_at, 
           s.status_name
         FROM orders o
         LEFT JOIN posts p ON o.post_id = p.id
         LEFT JOIN status s ON o.status_id = s.id
         LEFT JOIN users u ON p.user_id = u.id
         LEFT JOIN profile pr ON p.profile_id = pr.id
         LEFT JOIN kad k ON p.kad_id = k.id
         WHERE o.rider_id = ? AND o.status_id IN (2,3,4)
         ORDER BY o.ordered_at DESC`,
        [rider_id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  // ดึง order ตาม id
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
           o.*, 
           p.kad_id, k.kad_name, p.store_name, p.product, 
           p.service_fee AS post_service_fee, p.price AS post_price, p.user_id AS post_user_id, 
           u.username, pr.name AS nickname, pr.picture AS avatar, 
           p.delivery, p.delivery_at, p.created_at AS post_created_at, 
           s.status_name
         FROM orders o
         LEFT JOIN posts p ON o.post_id = p.id
         LEFT JOIN status s ON o.status_id = s.id
         LEFT JOIN users u ON p.user_id = u.id
         LEFT JOIN profile pr ON p.profile_id = pr.id
         LEFT JOIN kad k ON p.kad_id = k.id
         WHERE o.id = ?`,
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }
};

module.exports = OrderRider;
