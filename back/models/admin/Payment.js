const db = require('../../config/db');

const Payment = {
  /** =============================
   *  ดึง order พร้อมข้อมูล customer, rider, status และ bank account ของ rider
   *  =============================
   */
  getById: (orderId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          o.id AS order_id,
          c.username AS customer_username,
          r.username AS rider_username,
          s.status_name,
          o.order_price,
          o.order_service_fee,
          o.ordered_at,
          rba.id AS rider_bank_account_id,
          rba.acc_number,
          rba.acc_owner,
          b.bank_name
        FROM orders o
        JOIN users c ON o.customer_id = c.id
        LEFT JOIN users r ON o.rider_id = r.id
        LEFT JOIN profile p ON r.id = p.user_id
        LEFT JOIN profile_bank_accounts rba ON p.id = rba.profile_id
        LEFT JOIN bank b ON rba.bank_id = b.id
        JOIN status s ON o.status_id = s.id
        WHERE o.id = ?
      `;
      db.query(query, [orderId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  /** =============================
   *  ดึง orders ทั้งหมด
   *  =============================
   */
  getAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT 
        o.id AS order_id,
        c.username AS customer_username,
        r.username AS rider_username,
        s.status_name,
        o.status_id,
        o.order_price,
        o.order_service_fee,
        o.ordered_at,
        rba.id AS rider_bank_account_id,
        rba.acc_number,
        rba.acc_owner,
        b.bank_name
      FROM orders o
      JOIN users c ON o.customer_id = c.id
      LEFT JOIN users r ON o.rider_id = r.id
      LEFT JOIN profile p ON r.id = p.user_id
      LEFT JOIN profile_bank_accounts rba ON p.id = rba.profile_id
      LEFT JOIN bank b ON rba.bank_id = b.id
      JOIN status s ON o.status_id = s.id
      WHERE o.status_id = 5
      GROUP BY o.id
    `;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // ดึง orders History (status_id = 7 หรือ 8)
  // ดึง orders History (status_id = 7 หรือ 8)
getHistory: () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.id AS order_id,
        c.username AS customer_username,
        r.username AS rider_username,
        s.status_name,
        o.order_price,
        o.order_service_fee,
        o.ordered_at,
        o.status_id,
        o.status_payment,
        o.slip_file AS slip_filename
      FROM orders o
      JOIN users c ON o.customer_id = c.id
      LEFT JOIN users r ON o.rider_id = r.id
      JOIN status s ON o.status_id = s.id
      WHERE o.status_id = 7 OR o.status_id = 8
      ORDER BY o.ordered_at DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
},

  /** =============================
 *  อัปเดต status_id ของ order
 *  =============================
 */
  updateStatus: (orderId, statusId, paymentStatus) => {
    return new Promise((resolve, reject) => {
      const query = `
      UPDATE orders
      SET status_id = ?, status_payment = ?
      WHERE id = ?
    `;
      db.query(query, [statusId, paymentStatus, orderId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // อัปเดตชื่อไฟล์ slip ใน order

  updateSlipFilename: (orderId, filename) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE orders SET slip_file = ? WHERE id = ?";
    db.query(query, [filename, orderId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
},

};

module.exports = Payment;
