const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// 🛡️ Security packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://finditnoww.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// ─────────────────────────────────────────────
// 🛡️ SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// 1. Helmet — sets secure HTTP headers
app.use(helmet());

// 2. CORS — only allow your frontend
app.use(cors({
  origin: ['https://finditnoww.netlify.app', 'http://localhost:3000'],
}));

// 3. Body parser with size limit — prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. MongoDB sanitize — prevents NoSQL injection
// Removes $ and . from req.body, req.query, req.params
app.use(mongoSanitize());

// 5. XSS clean — prevents cross site scripting
// Cleans <script> tags from all inputs
app.use(xss());

// 6. HPP — prevents HTTP parameter pollution
app.use(hpp());

// 7. Global rate limiter — max 100 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 8. Strict rate limiter for auth routes — max 10 attempts per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/items',    require('./routes/items'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users',    require('./routes/users'));

// Health check
app.get('/', (req, res) => res.json({ message: 'FindIt API running' }));

// ─────────────────────────────────────────────
// 404 handler — unknown routes
// ─────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─────────────────────────────────────────────
// SOCKET.IO — real-time chat
// ─────────────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on('sendMessage', ({ senderId, receiverId, message, itemId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message,
        itemId,
        timestamp: new Date(),
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// ─────────────────────────────────────────────
// CONNECT TO MONGODB & START SERVER
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = { app, io };