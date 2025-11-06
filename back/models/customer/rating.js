const db = require('../../config/db');

const Rating = {
  create: (userId, orderId, rating, comment) => {
    return new Promise((resolve, reject) => {
      // ดึง rider_id จาก order
      const sqlGetRider = `SELECT rider_id FROM orders WHERE post_id = ? LIMIT 1`;

      db.query(sqlGetRider, [orderId], (err, results) => {
        if (err) return reject(err);
        if (!results.length) return reject(new Error("Order not found"));

        const riderId = results[0].rider_id;

        // ✅ insert rating พร้อม user_id
        const sqlInsert = `
          INSERT INTO ratings (rider_id, order_id, user_id, rating, comment)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sqlInsert, [riderId, orderId, userId, rating, comment], (err2, result) => {
          if (err2) {
            // ตรวจสอบ error duplicate
            if (err2.code === 'ER_DUP_ENTRY') {
              return reject(new Error('คุณได้รีวิว order นี้ไปแล้ว'));
            }
            return reject(err2);
          }

          resolve({
            id: result.insertId,
            rider_id: riderId,
            order_id: orderId,
            user_id: userId,
            rating,
            comment,
          });
        });
      });
    });
  },
};

module.exports = Rating;
