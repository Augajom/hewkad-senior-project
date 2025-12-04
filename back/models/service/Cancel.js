const db = require('../../config/db');

const Cancel = {
  create: (postId, reporterId, reasonId, detail, reportFile = '') => {
    return new Promise((resolve, reject) => {
      const sqlInsert = `
        INSERT INTO reports (post_id, reporter_id, reason_id, detail, report_file)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, [postId, reporterId, reasonId, detail, reportFile], (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, success: true });
      });
    });
  },

  updateStatusToCancel: (postId) => {
    return new Promise((resolve, reject) => {
      const sqlUpdatePosts = `
        UPDATE posts
        SET status_id = 10
        WHERE id = ?
      `;
      const sqlUpdateOrders = `
        UPDATE orders
        SET status_id = 10
        WHERE post_id = ?
      `;

      // อัปเดต posts ก่อน
      db.query(sqlUpdatePosts, [postId], (err, resultPosts) => {
        if (err) return reject(err);
        if (resultPosts.affectedRows === 0)
          return reject(new Error('Post not found'));

        // อัปเดต orders ต่อ
        db.query(sqlUpdateOrders, [postId], (err, resultOrders) => {
          if (err) return reject(err);
          resolve({ 
            success: true, 
            message: 'Post and Orders status updated to Cancel (status_id = 10)' 
          });
        });
      });
    });
  },

  getReportsByPost: (postId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.id, 
          r.detail, 
          r.report_file,
          r.created_at, 
          rr.title AS reason, 
          u.username AS reporter
        FROM reports r
        JOIN report_reasons rr ON r.reason_id = rr.id
        JOIN users u ON r.reporter_id = u.id
        WHERE r.post_id = ?
        ORDER BY r.created_at DESC
      `;
      db.query(sql, [postId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getReportReasons: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, title FROM report_reasons ORDER BY id ASC`;
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = Cancel;
