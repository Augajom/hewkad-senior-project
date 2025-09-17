const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  /** =============================
   *  Local Register (username + password)
   *  =============================
   */
  create: async (username, password, email, name, phone_num, bank, acc_number, acc_owner) => {
    try {
      // 1️⃣ ตรวจสอบ username หรือ email ซ้ำ
      const existingUser = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
          [username, email],
          (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
          }
        );
      });

      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      // 2️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3️⃣ Insert user ลง users table
      const result = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())',
          [username, hashedPassword, email],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      const userId = result.insertId;

      // 4️⃣ สร้าง profile อัตโนมัติ
      const profileResult = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO profile (user_id, name, phone_num, email) VALUES (?, ?, ?, ?)',
          [userId, name, phone_num, email],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      const profileId = profileResult.insertId;

      // 5️⃣ สร้างบัญชี bank account
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO profile_bank_accounts (profile_id, bank_id, acc_number, acc_owner) VALUES (?, ?, ?, ?)',
          [profileId, bank, acc_number, acc_owner],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // 6️⃣ กำหนด role customer อัตโนมัติ
      const customerRole = await new Promise((resolveRole, rejectRole) => {
        db.query(
          'SELECT id FROM roles WHERE role_name = ? LIMIT 1',
          ['customer'],
          (err, results) => {
            if (err) return rejectRole(err);
            resolveRole(results[0]); // results[0] เป็น object
          }
        );
      });

      if (customerRole) {
        await new Promise((resolveRoleInsert, rejectRoleInsert) => {
          db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, customerRole.id],
            (err) => {
              if (err) return rejectRoleInsert(err);
              resolveRoleInsert();
            }
          );
        });
      }

      return { id: userId, username, email };

    } catch (err) {
      throw err;
    }
  },

  /** =============================
   *  OAuth Register (Google)
   *  =============================
   */
  createOAuth: async (email, name) => {
    try {
      const userId = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())',
          [email, email, null], // ใช้ email เป็น username ชั่วคราว และ password = null
          (err, results) => {
            if (err) return reject(err);
            resolve(results.insertId);
          }
        );
      });

      // insert profile
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO profile (user_id, name, email) VALUES (?, ?, ?)',
          [userId, name, email],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      // 1️⃣ ดึง role "customer"
      const customerRole = await new Promise((resolve, reject) => {
        db.query(
          'SELECT id FROM roles WHERE role_name = ? LIMIT 1',
          ['customer'],
          (err, results) => {
            if (err) return reject(err);
            resolve(results[0]); // results[0] เป็น object
          }
        );
      });

      // 2️⃣ insert user_roles
      if (customerRole) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, customerRole.id],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      return { id: userId, username: email, email, name };
    } catch (err) {
      throw err;
    }
  },

  /** =============================
   *  Helpers
   *  =============================
   */
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  getRoles: (userId, onlyActive = false) => {
    return new Promise((resolve, reject) => {
      let query = `
      SELECT r.role_name
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `;

      const params = [userId];

      if (onlyActive) {
        query += ' AND ur.is_Active = 1';
      }

      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(r => r.role_name));
      });
    });
  }
};




module.exports = User;
