const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  POSTGRES_URL: process.env.POSTGRES_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  ENABLE_REDIS_JOBS: String(process.env.ENABLE_REDIS_JOBS || 'false').toLowerCase() === 'true',
};
