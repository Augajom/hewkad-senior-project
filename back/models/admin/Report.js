const db = require("../../config/db");
const { 
  sendReportReopenEmailToRider, 
  sendReportReopenEmailToCustomer,
  sendRefundEmailToCustomer  // ✅ เพิ่ม
} = require("../../utils/NotiReportEmail");

const Report = {
  resolveReport: (orderId, resolved_detail, filePath) => {
    return new Promise(async (resolve, reject) => {
      try {
        // ดึง post_id และ reason_id ของ report
        const reportData = await new Promise((resolve, reject) => {
          db.query(
            `SELECT r.post_id, r.reason_id 
             FROM reports r 
             JOIN orders o ON o.post_id = r.post_id 
             WHERE o.id = ?`,
            [orderId],
            (err, results) => {
              if (err) return reject(err);
              if (results.length === 0) return reject(new Error("Order not found"));
              resolve(results[0]);
            }
          );
        });

        const postId = reportData.post_id;
        let newStatus = "Reported";

        // ถ้า reason_id = 2,3,4 → เปลี่ยน newStatus เป็น "Ordering"
        if ([2, 3, 4].includes(reportData.reason_id)) {
          newStatus = "Ordering";
        }
        // ถ้า reason_id = 1 → status = "Reported" (refund)  ✅ อยู่แล้ว

        db.getConnection((err, connection) => {
          if (err) return reject(err);

          connection.beginTransaction((err) => {
            if (err) { connection.release(); return reject(err); }

            const updateReport = `
              UPDATE reports
              SET \`Resloved detail\` = ?, resolved_file = ?
              WHERE post_id = ?
            `;
            connection.query(updateReport, [resolved_detail, filePath, postId], (err) => {
              if (err) return connection.rollback(() => { connection.release(); reject(err); });

              const updatePost = `
                UPDATE posts
                SET status_id = (SELECT id FROM status WHERE status_name = ?)
                WHERE id = ?
              `;
              connection.query(updatePost, [newStatus, postId], (err) => {
                if (err) return connection.rollback(() => { connection.release(); reject(err); });

                const updateOrder = `
                  UPDATE orders
                  SET status_id = (SELECT id FROM status WHERE status_name = ?)
                  WHERE id = ?
                `;
                connection.query(updateOrder, [newStatus, orderId], async (err) => {
                  if (err) return connection.rollback(() => { connection.release(); reject(err); });

                  connection.commit(async (err) => {
                    if (err) return connection.rollback(() => { connection.release(); reject(err); });
                    connection.release();

                    // ส่งอีเมลตาม reason_id
                    if ([2,3,4].includes(reportData.reason_id)) {
                      await sendReportReopenEmailToRider(orderId);
                      await sendReportReopenEmailToCustomer(orderId);
                    } else if (reportData.reason_id === 1) {
                      await sendRefundEmailToCustomer(orderId);
                    }

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
