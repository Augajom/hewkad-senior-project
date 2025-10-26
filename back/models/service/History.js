const db = require('../../config/db');

const OrderHistory = {
  // ดึง order ของ rider ปัจจุบันที่ status = Complete
  getByRider: (riderId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
           o.id AS order_id,
           o.post_id,
           o.order_price,
           o.order_service_fee,
           o.delivery_address,
           o.delivery_time,
           o.ordered_at,
           o.completed_at,
           s.status_name AS order_status,
           o.status_payment,
           o.slip_file AS slip_filename,
           p.store_name,
           p.product,
           p.price AS post_price,
           p.service_fee AS post_service_fee,
           p.user_id AS customer_id,
           pr.nickname AS customer_username,
           pr.name AS customer_name,
           pr.picture AS customer_avatar,
           k.kad_name
         FROM orders o
         JOIN status s ON o.status_id = s.id
         JOIN posts p ON o.post_id = p.id
         JOIN users u ON p.user_id = u.id
         JOIN profile pr ON p.profile_id = pr.id
         JOIN kad k ON p.kad_id = k.id
         WHERE o.rider_id = ? 
         ORDER BY 
           CASE WHEN o.completed_at IS NULL THEN 1 ELSE 0 END, 
           o.completed_at DESC`,
        [riderId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }
};

module.exports = OrderHistory;