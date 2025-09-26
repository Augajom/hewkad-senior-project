// models/customer/Report.js
const db = require('../../config/db');

const Report = {
  create: (postId, reporterId, reasonId, detail) => {
    return new Promise((resolve, reject) => {
      const sqlInsert = `
        INSERT INTO reports (post_id, reporter_id, reason_id, detail)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sqlInsert, [postId, reporterId, reasonId, detail], (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, success: true });
      });
    });
  },

  updatePostStatusToReported: (postId) => {
    return new Promise((resolve, reject) => {
      const sqlUpdate = `
        UPDATE posts
        SET status_id = (SELECT id FROM status WHERE status_name = 'Reported')
        WHERE id = ?
      `;
      db.query(sqlUpdate, [postId], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) return reject(new Error('Post not found'));
        resolve({ success: true, message: 'Post status updated to Reported' });
      });
    });
  },

  getReportsByPost: (postId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.id, r.detail, r.created_at, rr.title AS reason, u.username AS reporter
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
}
  
};

module.exports = Report;
