import dotenv from 'dotenv';
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  // Changed default port from 5000 to 5001 to avoid EADDRINUSE conflicts
  port: parseInt(process.env.PORT, 10) || 5001,

  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/billmaster',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'billmaster_super_secret_jwt_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    // Frontend dev server runs on 5173 (Vite default)
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export default config;
