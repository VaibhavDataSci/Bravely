const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  POSTGRES_URL: process.env.POSTGRES_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};
