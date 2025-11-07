const db = require("../../config/db");

const Report = {
  resolveReport: (orderId, resolved_detail, filePath, newStatus = "Reported") => {
    return new Promise(async (resolve, reject) => {
      try {
        // ดึง post_id จาก order
        const postId = await new Promise((resolve, reject) => {
          db.query("SELECT post_id FROM orders WHERE id = ?", [orderId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error("Order not found"));
            resolve(results[0].post_id);
          });
        });

        db.getConnection((err, connection) => {
          if (err) return reject(err);

          connection.beginTransaction(err => {
            if (err) { connection.release(); return reject(err); }

            // อัปเดต reports
            const updateReport = `
              UPDATE reports
              SET \`Resloved detail\` = ?, resolved_file = ?
              WHERE post_id = ?
            `;
            connection.query(updateReport, [resolved_detail, filePath, postId], (err, result) => {
              if (err) return connection.rollback(() => { connection.release(); reject(err); });

              // อัปเดต posts
              const updatePost = `
                UPDATE posts
                SET status_id = (SELECT id FROM status WHERE status_name = ?)
                WHERE id = ?
              `;
              connection.query(updatePost, [newStatus, postId], (err, result2) => {
                if (err) return connection.rollback(() => { connection.release(); reject(err); });

                // อัปเดต orders
                const updateOrder = `
                  UPDATE orders
                  SET status_id = (SELECT id FROM status WHERE status_name = ?)
                  WHERE id = ?
                `;
                connection.query(updateOrder, [newStatus, orderId], (err, result3) => {
                  if (err) return connection.rollback(() => { connection.release(); reject(err); });

                  connection.commit(err => {
                    if (err) return connection.rollback(() => { connection.release(); reject(err); });
                    connection.release();
                    resolve({ success: true, message: `Report resolved and status updated to ${newStatus}` });
                  });
                });
              });
            });
          });
        });

      } catch (err) {
        reject(err);
      }
    });
  },
};

module.exports = Report;
