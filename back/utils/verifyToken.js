const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  // เพิ่มบรรทัดนี้!
  console.log('=== Incoming Cookies:', req.cookies);

  const token = req.cookies?.token;

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

<<<<<<< HEAD
module.exports = verifyToken;
=======
module.exports = authenticateJWT;
>>>>>>> f77f3c08b42ef9cdacd17435dcedb84c2cdd25d7
