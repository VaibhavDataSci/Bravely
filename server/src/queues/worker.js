const { Worker } = require('bullmq');
const { REDIS_URL } = require('../config/env');
const IORedis = require('ioredis');

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const reportsWorker = new Worker('reportsQueue', async (job) => {
  console.log(`Processing job ${job.id} for session ${job.data.sessionId}`);
  
  // Placeholder: generate report via Claude Sonnet 4.5 and save to DB
  // await aiService.generateReport(job.data.sessionId);
  
  console.log(`Job ${job.id} completed successfully`);
  return { success: true };
}, { connection });

reportsWorker.on('completed', (job) => {
  console.log(`${job.id} has completed!`);
});

reportsWorker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

module.exports = {
  reportsWorker,
};
