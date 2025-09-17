const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
const historyRoutes = require('./api/customer'); // 👈 path must be correct

app.use('/history', historyRoutes);