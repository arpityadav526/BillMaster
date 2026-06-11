import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAnalyticsDashboard } from './server/src/services/analyticsService.js';
import User from './server/src/models/User.js';

dotenv.config({ path: './server/.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billmaster');
  console.log('Connected to DB');
  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(0);
  }
  console.log('Testing for user:', user._id);
  try {
    const data = await getAnalyticsDashboard(user._id);
    console.log('Success! Data keys:', Object.keys(data));
  } catch (err) {
    console.error('Error in getAnalyticsDashboard:', err);
  }
  process.exit(0);
}

test();
