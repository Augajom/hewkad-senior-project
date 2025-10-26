function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(498).json({ message: "Not logged in" });
    }

    const roles = req.user.roles || [];

    if (!roles.includes(roleName)) {
      return res.status(499).json({ message: "No permission" });
    }

    next();
  };
}

module.exports = requireRole;
