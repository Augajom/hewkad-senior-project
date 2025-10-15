const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });
  try {
    const p = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: p.id || p.userId || p.sub,
      email: p.email || null,
      fullName: p.fullName || p.name || null,
      picture: p.picture || null,
      roles: Array.isArray(p.roles) ? p.roles : [],
      profile_id: p.profile_id || null
    };
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}


module.exports = verifyToken;
