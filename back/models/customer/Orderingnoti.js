const db = require('../../config/db');

const Orderingnoti = {
  getPostIdByOrderId: (orderId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT post_id FROM orders WHERE id = ?`;
      db.query(sql, [orderId], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error('Order not found'));
        resolve(results[0].post_id);
      });
    });
  },

  getOwnerEmailByPostId: (postId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          u.email, 
          pr.name AS nickname, 
          p.product, 
          p.store_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN profile pr ON p.profile_id = pr.id
        WHERE p.id = ?
      `;
      db.query(sql, [postId], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error('Post not found'));
        resolve(results[0]);
      });
    });
  },

  updateStatus: (orderId, newStatus) => {
    return new Promise(async (resolve, reject) => {
      try {
        const postId = await Orderingnoti.getPostIdByOrderId(orderId);

        db.getConnection((err, connection) => {
          if (err) return reject(err);

          connection.beginTransaction(err => {
            if (err) { connection.release(); return reject(err); }

            const updatePosts = `
              UPDATE posts
              SET status_id = (SELECT id FROM status WHERE status_name = ?)
              WHERE id = ?
            `;
            connection.query(updatePosts, [newStatus, postId], (err, result) => {
              if (err) return connection.rollback(() => { connection.release(); reject(err); });
              if (result.affectedRows === 0) return connection.rollback(() => { connection.release(); reject(new Error('Post not found')); });

              const updateOrders = `
                UPDATE orders
                SET status_id = (SELECT id FROM status WHERE status_name = ?)
                WHERE id = ?
              `;
              connection.query(updateOrders, [newStatus, orderId], (err, result2) => {
                if (err) return connection.rollback(() => { connection.release(); reject(err); });

                connection.commit(err => {
                  if (err) return connection.rollback(() => { connection.release(); reject(err); });
                  connection.release();
                  resolve({ success: true, message: `Order status updated to ${newStatus}` });
                });
              });
            });
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }
};

module.exports = Orderingnoti;
