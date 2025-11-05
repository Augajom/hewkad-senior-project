// models/history.js
const db = require("../../config/db.js");

const History = {
  getByStatus: (status, userId = null) => {
    return new Promise((resolve, reject) => {
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
          pr.picture AS avatar,
          o.proof_url  -- ดึง proof_url จาก orders
        FROM posts p
        JOIN profile pr ON p.profile_id = pr.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN kad k ON p.kad_id = k.id
        LEFT JOIN status s ON p.status_id = s.id
        LEFT JOIN orders o ON o.post_id = p.id  -- join กับ orders
        WHERE s.status_name = ?
      `;

      const params = [status];

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
  }
};

module.exports = History;
