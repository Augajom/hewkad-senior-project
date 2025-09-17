const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  // สร้าง user ใหม่ (register)
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

      // 4️⃣ สร้าง profile อัตโนมัติ (copy email จาก users)
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

      // สร้างบัญชี bank account อัตโนมัติ (ตัวอย่าง)
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO profile_bank_accounts (profile_id, bank_id, acc_number, acc_owner) VALUES (?, ?, ?, ?)',
          [profileId, bank, acc_number, acc_owner], // ใส่ค่า default หรือจาก input
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // 5️⃣ กำหนด role customer อัตโนมัติ
      const [customerRole] = await new Promise((resolve, reject) => {
        db.query(
          'SELECT id FROM roles WHERE role_name = ? LIMIT 1',
          ['customer'],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (customerRole) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, customerRole.id],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });
      }

      return { id: userId, username, email };
    } catch (err) {
      throw err;
    }
  },

  // หาผู้ใช้ตาม username
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE username = ? LIMIT 1',
        [username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  },

  // หาผู้ใช้ตาม id
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  },

  // ดึง role ทั้งหมดของ user
  getRoles: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT r.role_name
         FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = ?`,
        [userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.map(r => r.role_name));
        }
      );
    });
  }
};




module.exports = User;
