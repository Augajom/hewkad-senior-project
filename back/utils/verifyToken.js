const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // ดึง token จาก header หรือ cookie
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // จะมี { id, roles } อยู่ในนี้
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message); // debug log
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = verifyToken;