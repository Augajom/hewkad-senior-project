const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173', // React frontend
  methods: ['GET', 'POST'],
}));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React frontend
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '../front/dist')));

app.get(/^(?!\/socket\.io).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../front/dist', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    // ส่งข้อความกลับให้ทุกคน (รวมถึงตัวเอง)
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
