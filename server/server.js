import app from './src/app.js';
import config from './src/config/index.js';
import connectDB from './src/config/db.js';
import fs from 'fs';
import http from 'http';
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

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`  ↗ WebSocket connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`  ↙ WebSocket disconnected: ${socket.id}`);
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

  // Initialize Schedulers (Background Jobs)
  const { initScheduler } = await import('./src/jobs/scheduler.js');
  initScheduler();

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
