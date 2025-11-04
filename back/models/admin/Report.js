const db = require("../../config/db");

const Report = {
  resolveReport: (orderId, resolved_detail, filePath) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE reports rp
        JOIN orders o ON rp.post_id = o.post_id
        JOIN posts p ON o.post_id = p.id
        SET 
          rp.\`Resloved detail\` = ?,
          rp.resolved_file = ?,
          o.status_id = 5,
          p.status_id = 5
        WHERE o.id = ?
      `;
      db.query(sql, [resolved_detail, filePath, orderId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = Report;
