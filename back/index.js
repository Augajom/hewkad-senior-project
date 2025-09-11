const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
require('dotenv').config();

// import routes
const indexRoute = require('./api/index.js');
const adminRoute = require('./api/admin.js');
const customerRoute = require('./api/customer.js');
const serviceRoute = require('./api/service.js');

// middleware สำหรับ auth (JWT + role)
const verifyToken = require('./utils/verifyToken');
const requireRole = require('./utils/requireRole');

// init express
const app = express();

// session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  cookie: { maxAge: 86400000 }
}));

// middleware พื้นฐาน
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// test route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello backend' });
});

// route
app.use('/', indexRoute);
app.use('/admin', verifyToken, requireRole('admin'), adminRoute);
app.use('/customer', verifyToken, requireRole('customer'), customerRoute);
app.use('/service', verifyToken, requireRole('service'), serviceRoute);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
