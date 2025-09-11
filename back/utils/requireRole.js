const db = require('../config/db'); // MySQL pool

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    const user = req.session.user;

    // 1. ตรวจสอบว่า login แล้ว
    if (!user) {
      return res.status(401).json({ message: 'You must be logged in' });
    }

    try {
      // 2. ดึง role ทั้งหมดของ user จาก DB
      const [roles] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT r.role_name
           FROM roles r
           JOIN user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = ?`,
          [user.id],
          (err, results) => {
            if (err) return reject(err);
            resolve([results]);
          }
        );
      });

      // map role_name เป็น array
      const userRoles = roles.map(r => r.role_name);

      // 3. ตรวจสอบ role
      if (Array.isArray(allowedRoles)) {
        if (!allowedRoles.some(r => userRoles.includes(r))) {
          return res.status(403).json({ message: 'Access denied: insufficient role' });
        }
      } else {
        if (!userRoles.includes(allowedRoles)) {
          return res.status(403).json({ message: 'Access denied: insufficient role' });
        }
      }

      // ผ่านการตรวจสอบ
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = requireRole;
