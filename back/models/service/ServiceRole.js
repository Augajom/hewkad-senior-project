const db = require("../../config/db");

const ServiceRole = {
  getCurrentRole: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT role_id, is_Active FROM user_roles WHERE user_id = ? AND is_Active = 1`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  },
};

module.exports = ServiceRole;
