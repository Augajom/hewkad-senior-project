const db = require("../../config/db");

const UserRole = {
  getCurrentRole: (userId, callback) => {
    db.query(
      `SELECT r.role_name, ur.id as user_role_id
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ? AND ur.is_Active = 1`,
      [userId],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
      }
    );
  },

  getRoleByName: (roleName, callback) => {
    db.query(
      `SELECT id FROM roles WHERE role_name = ?`,
      [roleName],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
      }
    );
  },

  deactivateCurrentRole: (userId, callback) => {
    db.query(
      `UPDATE user_roles SET is_Active = 0 WHERE user_id = ? AND is_Active = 1`,
      [userId],
      callback
    );
  },

  activateRole: (userId, roleId, callback) => {
    db.query(
      `INSERT INTO user_roles (user_id, role_id, is_Active) VALUES (?, ?, 1)`,
      [userId, roleId],
      callback
    );
  },
};

module.exports = UserRole;
