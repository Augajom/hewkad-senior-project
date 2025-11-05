const db = require('../../config/db');

const Rating = {
  create: (userId, orderId, rating, comment) => {
    return new Promise((resolve, reject) => {
      // ✅ ปรับตรงนี้: ให้รองรับทั้ง order_id และ post_id
      const sqlGetRider = `
        SELECT rider_id 
        FROM orders 
        WHERE id = ? OR post_id = ?
        LIMIT 1
      `;

      db.query(sqlGetRider, [orderId, orderId], (err, results) => {
        if (err) return reject(err);
        if (!results.length) return reject(new Error("Order not found"));

        const riderId = results[0].rider_id;

        // ✅ insert rating
        const sqlInsert = `
          INSERT INTO ratings (rider_id, order_id, rating, comment)
          VALUES (?, ?, ?, ?)
        `;
        db.query(sqlInsert, [riderId, orderId, rating, comment], (err2, result) => {
          if (err2) return reject(err2);
          resolve({
            id: result.insertId,
            rider_id: riderId,
            order_id: orderId,
            rating,
            comment,
          });
        });
      });
    });
  },
};

module.exports = Rating;
