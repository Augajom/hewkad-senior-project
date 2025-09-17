const db = require('../config/db');

const Kad = {
  // ดึงทุกตลาด
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id, kad_name
         FROM kad
         ORDER BY kad_name ASC`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  // ดึงตลาดตาม id
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id, kad_name
         FROM kad
         WHERE id = ?`,
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  }
};

module.exports = Kad;