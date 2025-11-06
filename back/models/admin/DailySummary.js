const db = require("../../config/db");

const DailySummary = {
  getSummary: (days = 10) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT date, total_orders 
         FROM daily_orders_summary 
         ORDER BY date DESC 
         LIMIT ?`,
        [days],
        (err, results) => {
          if (err) return reject(err);
          // เรียงจากวันเก่า -> ใหม่
          resolve(results.reverse());
        }
      );
    });
  },
};

module.exports = DailySummary;
