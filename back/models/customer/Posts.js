const db = require('../../config/db');

const post = {
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
          p.user_id,       -- เพิ่ม user_id
          p.profile_id,    -- เพิ่ม profile_id
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


  // ดึงโพสต์ตาม id
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT p.id, k.kad_name, p.store_name, p.product,
                p.service_fee, p.price, u.username, pr.name AS nickname,
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
  },

  // สร้างโพสต์ใหม่
  create: (kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at) => {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO posts 
       (kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at],
        (err, results) => {
          if (err) return reject(err);
          resolve({
            id: results.insertId,
            kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at
          });
        }
      );
    });
  },

  // แก้ไขโพสต์
  update: (id, fields) => {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(fields).filter(key => fields[key] !== '' && fields[key] !== null && fields[key] !== undefined);
      if (keys.length === 0) return resolve(false);

      const updates = keys.map(key => `${key} = ?`).join(', ');
      const values = keys.map(key => fields[key]);
      values.push(id);

      db.query(
        `UPDATE posts SET ${updates} WHERE id = ?`,
        values,
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  },

  // ลบโพสต์
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM posts WHERE id = ?',
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }
};

module.exports = post;
