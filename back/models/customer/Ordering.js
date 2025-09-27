// models/customer/Ordering.js
const db = require('../../config/db');

const Ordering = {
  getByStatus: (statuses = [], userId = null) => {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(statuses)) statuses = [statuses];

      if (statuses.length === 0) {
        return resolve([]); 
      }

      const placeholders = statuses.map(() => '?').join(',');
      const params = [...statuses];

      let sql = `
        SELECT 
          p.id,
          pr.name AS nickname,
          u.username,
          p.store_name,
          p.product,
          p.service_fee,
          p.price,
          p.delivery AS deliveryLocation,
          p.delivery_at AS receivingTime,
          k.kad_name AS kadName,
          s.status_name AS status,
          pr.picture AS avatar
        FROM posts p
        JOIN profile pr ON p.profile_id = pr.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN kad k ON p.kad_id = k.id
        LEFT JOIN status s ON p.status_id = s.id
        WHERE s.status_name IN (${placeholders})
      `;

      if (userId !== null) {
        sql += ' AND p.user_id = ?';
        params.push(userId);
      }

      sql += ' ORDER BY p.created_at DESC';

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // เพิ่ม method update status
  updateStatus: (orderId, newStatus) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE posts p
        JOIN status s ON p.status_id = s.id
        SET p.status_id = (
          SELECT id FROM status WHERE status_name = ?
        )
        WHERE p.id = ?
      `;
      db.query(sql, [newStatus, orderId], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error('Order not found'));
        }
        resolve({ success: true, message: 'Order status updated' });
      });
    });
  }
};

module.exports = Ordering;
