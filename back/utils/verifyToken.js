const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // ดึง token จาก header หรือ cookie
  const cookieToken  = req.cookies?.token;
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  if (!token) {
    // เพิ่ม log เมื่อไม่มี token
    console.log('Cookies:', req.cookies);
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // เพิ่ม log เมื่อ verify สำเร็จ
    console.log('=== JWT decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    // เพิ่ม log เมื่อ JWT verify ไม่สำเร็จ
    console.log('=== JWT verify error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = verifyToken;