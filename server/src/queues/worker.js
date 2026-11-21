import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL } from '../config/env.js';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const reportsWorker = new Worker('reportsQueue', async (job) => {
  console.log(`Processing job ${job.id} for session ${job.data.sessionId}`);

  // Placeholder: generate report via the AI provider and save to DB
  // await aiService.generateReport(job.data.sessionId);

  console.log(`Job ${job.id} completed successfully`);
  return { success: true };
}, { connection });

reportsWorker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
