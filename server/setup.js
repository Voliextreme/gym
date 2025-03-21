require('dotenv').config();

if (!process.env.MONGO_URI) {
  throw new Error('Missing MONGO_URI in .env');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Invalid JWT_SECRET - must be at least 32 characters');
}

console.log('Environment variables validated!');