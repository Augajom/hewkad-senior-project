const db = require("../../config/db");

const getKad = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id, kad_name FROM kad ORDER BY kad_name ASC`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },
};

module.exports = getKad;
