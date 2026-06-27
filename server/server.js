import app from './src/app.js';
import config from './src/config/index.js';
import connectDB from './src/config/db.js';
import fs from 'fs';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

// Ensure uploads directory exists
['uploads', 'uploads/avatars', 'uploads/receipts', 'uploads/csv'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const start = async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  💰 BillMaster Server Starting...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Connect to MongoDB
  await connectDB();

  // Create HTTP server and wrap Express app
  const server = http.createServer(app);

  // Initialize Socket.io with proper CORS
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Allow both transports for better reliability
    transports: ['websocket', 'polling'],
    // Ping/pong settings to detect dead connections
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ========== SOCKET AUTHENTICATION MIDDLEWARE ==========
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      console.log('  ↗ Socket auth failed: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.log('  ↗ Socket auth failed: Invalid token');
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // ========== SOCKET CONNECTION HANDLER ==========
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`  ↗ WebSocket connected: ${socket.id} (user: ${userId})`);
    
    // Join a user-specific room for targeted notifications
    socket.join(`user:${userId}`);

    socket.on('disconnect', (reason) => {
      console.log(`  ↙ WebSocket disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`  ✗ Socket error for ${socket.id}:`, err.message);
    });
  });

  // Make io accessible throughout the app
  app.set('io', io);

  // Handle port already in use gracefully
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${config.port} is already in use!`);
      console.error(`   Try: kill $(lsof -ti:${config.port}) or change PORT in server/.env`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // Initialize Schedulers (Background Jobs) — pass io for real-time events
  const { initScheduler } = await import('./src/jobs/scheduler.js');
  initScheduler(io);

  // Start HTTP server
  server.listen(config.port, () => {
    console.log(`\n  ✓ API & WebSockets → http://localhost:${config.port}`);
    console.log(`  ✓ Health check    → http://localhost:${config.port}/api/health`);
    console.log(`  ✓ Environment     → ${config.env}`);
    console.log(`  ✓ Client URL      → ${config.cors.origin}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n  ↓ Received ${signal}, shutting down gracefully...`);
    io.close(); // Close all socket connections
    server.close(() => {
      console.log('  ✓ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  console.error('\n❌ Failed to start BillMaster server:', err);
  process.exit(1);
});
