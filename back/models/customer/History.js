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
  CASE WHEN s.status_name = 'Successfully' THEN 'Complete' ELSE s.status_name END AS status,
  p.status_id,
  pr.picture AS avatar,
  MAX(o.proof_url) AS proof_url,
  MAX(rp.resolved_file) AS resolved_file
FROM posts p
JOIN profile pr ON p.profile_id = pr.id
JOIN users u ON p.user_id = u.id
LEFT JOIN kad k ON p.kad_id = k.id
LEFT JOIN status s ON p.status_id = s.id
LEFT JOIN orders o ON o.post_id = p.id
LEFT JOIN reports rp ON rp.post_id = p.id
WHERE p.user_id = ?
`;

      const params = [userId];

      // กำหนด condition ตาม status
      if (status && status !== "All") {
        if (status === "Complete") {
          // รวม Successfully
          sql += ` AND (s.status_name = 'Complete' OR s.status_name = 'Successfully')`;
        } else {
          sql += ` AND s.status_name = ?`;
          params.push(status);
        }
      } else if (status === "All") {
        // All → ดึงเฉพาะ Complete, Successfully, Reporting, Reported
        sql += ` AND (s.status_name = 'Complete' OR s.status_name = 'Successfully' OR s.status_name = 'Reporting' OR s.status_name = 'Reported')`;
      }

      // GROUP BY เพื่อรวมโพสต์แต่ละโพสต์เป็น 1 row
      sql += `
GROUP BY 
  p.id, pr.name, u.username, p.store_name, p.product, p.service_fee, p.price,
  p.delivery, p.delivery_at, k.kad_name, s.status_name, p.status_id, pr.picture
ORDER BY p.created_at DESC
`;

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};

module.exports = History;
