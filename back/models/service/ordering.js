const db = require("../../config/db");

const Ordering = {
  updateStatus: (order_id, status_name) => {
    return new Promise((resolve, reject) => {
      // แปลง status_name เป็น status_id (สมมติ)
      const statusMap = {
        "Ordering": 1,
        "Rider Received": 2,
        "Order Received": 3,
        "Reported": 4,
      };
      const status_id = statusMap[status_name] || 1;

      db.query(
        "UPDATE orders SET status_id = ?, status_payment = ? WHERE id = ?",
        [status_id, status_name, order_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },
};

module.exports = Ordering;