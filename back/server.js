const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');


// import routes
const authRoute = require('./routes/auth.js');
const adminRoute = require('./api/admin.js');
const customerRoute = require('./api/customer.js');
const serviceRoute = require('./api/service.js');
const historyRoute = require('./api/customer.js');
const profileRoute =require('./routes/profile.js')


// middleware สำหรับ auth (JWT + role)
const verifyToken = require('./utils/verifyToken.js');
const requireRole = require('./utils/requireRole.js');



// init express
const app = express();

// CORS + cookie-parser ต้องมาก่อน route ทุกตัว!!
app.use(cors({
  origin: 'http://localhost:5173',  // <<< ให้ตรงกับ frontend
  credentials: true
}));

// middleware พื้นฐาน
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL ของ React app
  credentials: true // ต้องมีเพื่อส่ง cookie
}));
app.use(passport.initialize()); 

// test route หลังจาก login
app.get('/profile', verifyToken, async (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName,  
    roles: req.user.roles
  });
});


// route
app.use('/auth', authRoute);
app.use('/admin', verifyToken, requireRole('admin'), adminRoute);
app.use('/customer', verifyToken, requireRole('customer'), customerRoute);
app.use('/service', verifyToken, requireRole('service'), serviceRoute);
app.use('/profile', verifyToken, profileRoute);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});