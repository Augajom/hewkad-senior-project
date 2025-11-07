const db = require("../../config/db");

const historyadmin = {
  // ✅ ดึงทั้งหมด (สถานะ 2 - 8)
  getAllHistory: () => {
    return new Promise((resolve, reject) => {
      const query = `
SELECT 
  o.id AS order_id,
  DATE_FORMAT(o.ordered_at, '%Y-%m-%d %H:%i:%s') AS ordered_date,

  -- CUSTOMER INFO
  cu.username AS customer_username,
  cu.email AS customer_email,
  pc.name AS customer_name,
  pc.picture AS customer_profile,

  -- RIDER INFO
  r.username AS rider_username,
  r.email AS rider_email,
  pr.name AS rider_name,
  pr.picture AS rider_profile,

  -- ORDER INFO
  s.status_name,
  o.order_price,
  o.order_service_fee,
  o.status_payment,
  o.slip_file AS slip_filename

FROM orders o
JOIN users cu ON o.customer_id = cu.id
LEFT JOIN (
  SELECT p1.* FROM profile p1
  INNER JOIN (
    SELECT user_id, MAX(id) AS latest_id FROM profile GROUP BY user_id
  ) p2 ON p1.id = p2.latest_id
) pc ON pc.user_id = cu.id
LEFT JOIN users r ON o.rider_id = r.id
LEFT JOIN (
  SELECT p1.* FROM profile p1
  INNER JOIN (
    SELECT user_id, MAX(id) AS latest_id FROM profile GROUP BY user_id
  ) p2 ON p1.id = p2.latest_id
) pr ON pr.user_id = r.id
JOIN status s ON o.status_id = s.id
WHERE o.status_id BETWEEN 2 AND 8
ORDER BY o.ordered_at DESC;
      `;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // 🚨 ดึงเฉพาะสถานะ Reported
 getReportedHistory: () => {
  return new Promise((resolve, reject) => {
    const query = `
SELECT 
  o.id AS order_id,
  DATE_FORMAT(rp.created_at, '%Y-%m-%d %H:%i:%s') AS date,
  
  -- Customer (Reporter)
  cu.username AS customer_username,
  cu.email AS customer_email,
  pcu.name AS customer_name,
  pcu.picture AS customer_profile,
  
  -- Rider (Reported User)
  ru.username AS rider_username,
  ru.email AS rider_email,
  pru.name AS rider_name,
  pru.picture AS rider_profile,

  -- Report detail
  rr.title AS reason_title,
  rp.detail AS report_detail,
  rp.\`Resloved detail\` AS resolved_detail,
  rp.resolved_file, -- ✅ เพิ่มตรงนี้
  rp.report_file,

  -- Order & Status info
  o.status_id,
  s.status_name

FROM reports rp
JOIN posts p ON rp.post_id = p.id
JOIN orders o ON o.post_id = p.id
JOIN users cu ON rp.reporter_id = cu.id
LEFT JOIN (
  SELECT p1.* FROM profile p1
  INNER JOIN (
    SELECT user_id, MAX(id) AS latest_id FROM profile GROUP BY user_id
  ) p2 ON p1.id = p2.latest_id
) pcu ON pcu.user_id = cu.id

LEFT JOIN users ru ON o.rider_id = ru.id
LEFT JOIN (
  SELECT p1.* FROM profile p1
  INNER JOIN (
    SELECT user_id, MAX(id) AS latest_id FROM profile GROUP BY user_id
  ) p2 ON p1.id = p2.latest_id
) pru ON pru.user_id = ru.id

LEFT JOIN report_reasons rr ON rp.reason_id = rr.id
LEFT JOIN status s ON o.status_id = s.id

-- ✅ ดึงทั้งที่ยังไม่แก้ (6,9,10) และที่แก้แล้ว (5)
WHERE o.status_id IN (5, 6, 9, 10)
ORDER BY rp.created_at DESC;
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
},

};


module.exports = historyadmin;
