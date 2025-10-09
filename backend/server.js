const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const socketHandler = require('./socket/socketHandler');

// Load environment variables
dotenv.config();

// For Render deployment
const PORT = process.env.PORT || 5000;

// Initialize express app
const app = express();

// Update CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'brainbattle_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const leaderboardRoutes = require('./routes/leaderboard');
const roomRoutes = require('./routes/roomRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rooms', roomRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'BrainBattle API is running!',
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.io handlers
socketHandler(io);

// Make io accessible to routes if needed
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
// const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io enabled`);
});