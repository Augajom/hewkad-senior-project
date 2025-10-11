const db = require('../../config/db');

const order = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          p.id, 
          p.kad_id, 
          k.kad_name, 
          p.store_name, 
          p.product, 
          p.service_fee, 
          p.price, 
          p.user_id,       
          p.profile_id,    
          u.username, 
          pr.name AS nickname,
          p.delivery, 
          p.delivery_at, 
          p.created_at, 
          pr.picture AS avatar, 
          s.status_name 
        FROM posts p
        JOIN status s ON p.status_id = s.id
        JOIN users u ON p.user_id = u.id
        JOIN profile pr ON p.profile_id = pr.id
        JOIN kad k ON p.kad_id = k.id
        ORDER BY p.created_at DESC`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  // ดึงโพสต์ตาม id (รวม user_id และ profile_id)
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT p.id, p.kad_id, k.kad_name, p.store_name, p.product,
                p.service_fee, p.price, p.user_id, p.profile_id,
                u.username, pr.name AS nickname,
                p.delivery, p.delivery_at, p.created_at, pr.picture AS avatar,
                s.status_name
         FROM posts p
         JOIN status s ON p.status_id = s.id
         JOIN users u ON p.user_id = u.id
         JOIN profile pr ON p.profile_id = pr.id
         JOIN kad k ON p.kad_id = k.id
         WHERE p.id = ?`,
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }
};

module.exports = order;
