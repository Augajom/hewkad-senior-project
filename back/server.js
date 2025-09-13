const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

// import routes
const authRoute = require('./routes/auth.js');
const adminRoute = require('./api/admin.js');
const customerRoute = require('./api/customer.js');
const serviceRoute = require('./api/service.js');

// middleware สำหรับ auth (JWT + role)
const verifyToken = require('./utils/verifyToken.js');
const requireRole = require('./utils/requireRole.js');

// init express
const app = express();

// middleware พื้นฐาน
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// test route หลังจาก login
app.get('/profile', (req, res) => {
  console.log('req.user:', req.user);
  res.json(req.user);
});

// route
app.use('/auth', authRoute);
app.use('/admin', verifyToken, requireRole('admin'), adminRoute);
app.use('/customer', verifyToken, requireRole('customer'), customerRoute);
app.use('/service', verifyToken, requireRole('service'), serviceRoute);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
