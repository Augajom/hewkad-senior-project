// models/User/Profile.js
const db = require('../config/db');

const getName = {
  getByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT name AS fullName
        FROM profile
        WHERE user_id = ?
        LIMIT 1
      `;
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.fullName || null);
      });
    });
  }
};

module.exports = getName;
