const db = require("../../config/db");

const Proof = {
  saveProofUrl: (orderId, proofUrl) => {
    return new Promise((resolve, reject) => {
      // ดึง post_id จาก orders.id
      db.query(
        `SELECT post_id FROM orders WHERE id = ?`,
        [orderId],
        (err, rows) => {
          if (err) return reject(err);
          if (rows.length === 0) return reject(new Error("Order not found"));

          const postId = rows[0].post_id;

          // อัปเดต proof_url ใน orders table
          db.query(
            `UPDATE orders 
             SET proof_url = ?, completed_at = NOW() 
             WHERE id = ?`,
            [proofUrl, orderId],
            (err2, result) => {
              if (err2) return reject(err2);

              resolve({ affectedRows: result.affectedRows, postId });
            }
          );
        }
      );
    });
  },
};

module.exports = Proof;
