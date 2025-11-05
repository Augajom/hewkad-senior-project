const db = require('../../config/db');

const manageUser = {
    getAllInfo: () => {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          u.id AS user_id,
          p.name,
          p.address,
          p.picture,
          p.phone_num,
          p.email,
          p.identity_file,
          ur.is_Active,
          ur.role_id,
          b.bank_id,
          bk.bank_name,
          b.acc_number,
          b.acc_owner
        FROM users AS u
        LEFT JOIN profile AS p ON p.user_id = u.id
        LEFT JOIN user_roles AS ur ON ur.user_id = u.id AND ur.role_id = 2
        LEFT JOIN profile_bank_accounts AS b ON b.profile_id = p.id
        LEFT JOIN bank AS bk ON bk.id = b.bank_id;
      `;
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    toggleWorkPermit: (userId, isActive) => {
        return new Promise((resolve, reject) => {
            // ตรวจว่ามีอยู่ไหม
            const checkQuery = `SELECT id FROM user_roles WHERE user_id = ? AND role_id = 2;`;

            db.query(checkQuery, [userId], (err, results) => {
                if (err) return reject(err);

                if (results.length > 0) {
                    // ถ้ามีแล้ว → update
                    const updateQuery = `
            UPDATE user_roles 
            SET is_Active = ?, update_at = CURRENT_TIMESTAMP(6)
            WHERE user_id = ? AND role_id = 2;
          `;
                    db.query(updateQuery, [isActive, userId], (err2, result2) => {
                        if (err2) reject(err2);
                        else resolve({ message: "Updated existing role", result: result2 });
                    });
                } else {
                    // ถ้ายังไม่มี → insert ใหม่
                    const insertQuery = `
            INSERT INTO user_roles (user_id, role_id, is_Active)
            VALUES (?, 2, ?);
          `;
                    db.query(insertQuery, [userId, isActive], (err3, result3) => {
                        if (err3) reject(err3);
                        else resolve({ message: "Created new role", result: result3 });
                    });
                }
            });
        });
    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            const queries = [
                'DELETE FROM profile_bank_accounts WHERE profile_id = (SELECT id FROM profile WHERE user_id = ?)',
                'DELETE FROM user_roles WHERE user_id = ?',
                'DELETE FROM profile WHERE user_id = ?',
                'DELETE FROM users WHERE id = ?',
            ];

            const executeNext = (i) => {
                if (i >= queries.length) return resolve({ message: 'User deleted successfully' });
                db.query(queries[i], [userId], (err) => {
                    if (err) return reject(err);
                    executeNext(i + 1);
                });
            };

            executeNext(0);
        });
    },

    getRequest: () => {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          u.id AS user_id,
          p.user_id,
          p.name,
          p.phone_num,
          p.address,
          p.identity_file,
          ur.is_Active,
          ur.role_id,
          ur.update_at,
          b.bank_id,
          bk.bank_name,
          b.acc_number,
          b.acc_owner
        FROM users AS u
        LEFT JOIN profile AS p ON p.user_id = u.id
        LEFT JOIN user_roles AS ur ON ur.user_id = u.id AND ur.role_id = 2
        LEFT JOIN profile_bank_accounts AS b ON b.profile_id = p.id
        LEFT JOIN bank AS bk ON bk.id = b.bank_id
        WHERE ur.role_id = 2
        AND ur.is_Active = 2;
      `;
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    updateRequestActive: (userId, isActive) => {
        return new Promise((resolve, reject) => {
            // ตรวจว่ามีอยู่ไหม
            const checkQuery = `SELECT id FROM user_roles WHERE user_id = ? AND role_id = 2;`;

            db.query(checkQuery, [userId], (err, results) => {
                if (err) return reject(err);

                if (results.length > 0) {
                    const updateQuery = `
            UPDATE user_roles 
            SET is_Active = ?, update_at = CURRENT_TIMESTAMP(6)
            WHERE user_id = ? AND role_id = 2;
          `;
                    db.query(updateQuery, [isActive, userId], (err2, result2) => {
                        if (err2) reject(err2);
                        else resolve({ message: "Updated existing role", result: result2 });
                    });
                }
            });
        });
    },
};

module.exports = manageUser;
