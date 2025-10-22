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
    db.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        // อัปเดต posts
        const updatePosts = `
          UPDATE posts
          SET status_id = (SELECT id FROM status WHERE status_name = ?)
          WHERE id = ?
        `;
        connection.query(updatePosts, [newStatus, orderId], (err, result) => {
          if (err) return connection.rollback(() => { connection.release(); reject(err); });

          if (result.affectedRows === 0) {
            return connection.rollback(() => { connection.release(); reject(new Error('Order not found')); });
          }

          // อัปเดต orders
          const updateOrders = `
            UPDATE orders
            SET status_id = (SELECT id FROM status WHERE status_name = ?)
            WHERE post_id = ?
          `;
          connection.query(updateOrders, [newStatus, orderId], (err, result2) => {
            if (err) return connection.rollback(() => { connection.release(); reject(err); });

            connection.commit((err) => {
              if (err) return connection.rollback(() => { connection.release(); reject(err); });
              connection.release();
              resolve({ success: true, message: `Order status updated to ${newStatus} for posts and orders` });
            });
          });
        });
      });
    });
  });
},
  getOwnerEmail: (orderId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          u.email, 
          pr.name AS nickname, 
          p.product, 
          p.store_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN profile pr ON p.profile_id = pr.id
        WHERE p.id = ?
      `;
      db.query(sql, [orderId], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error('Order not found'));
        resolve(results[0]);
      });
    });
  }
  
  
};

module.exports = Ordering;
