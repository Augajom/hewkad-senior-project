function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const roles = req.user.roles || []; // ควรเป็น array เช่น ['customer','admin']

    if (!roles.includes(roleName)) {
      return res.status(403).json({ message: "Don't have permission" });
    }

    next(); // ผ่าน → ไปต่อ
  };
}

module.exports = requireRole;
