const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const db = require('./config/db');
require('dotenv').config();
require('./config/passport');
require('./models/admin/DailyOrdersSummary.js')

const authRoute = require('./routes/auth.js');
const adminRoute = require('./api/admin.js');
const customerRoute = require('./api/customer.js');
const serviceRoute = require('./api/service.js');
const profileRoute = require('./routes/profile.js');
const uploadRoute = require('./routes/upload.js');
const loginRoute = require('./routes/login.js');
const logoutRoute = require('./routes/logout.js')
const verifyToken = require('./utils/verifyToken.js');
const requireRole = require('./utils/requireRole.js');
const orderAutoComplete = require('./api/customer.js');


const app = express();

app.set('etag', false);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'] // 👈 เพิ่มบรรทัดนี้
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());


app.use("/Files", express.static(path.join(__dirname, "Files")));
app.use("/Files", express.static("Files"));

app.use('/auth', authRoute);
app.use('/admin', verifyToken, requireRole('admin'), adminRoute);
app.use('/customer', verifyToken, requireRole('customer'), customerRoute);
app.use('/service', verifyToken, requireRole('service'), serviceRoute);
app.use('/profile', verifyToken, profileRoute);
app.use('/upload', verifyToken, uploadRoute);
app.use(orderAutoComplete);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Admin
app.use('/login', loginRoute);
app.use('/logout', logoutRoute)

// live-chat-get-token
app.get('/me', verifyToken, (req, res) => {
  res.json(req.user); 
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
