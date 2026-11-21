import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL } from '../config/env.js';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const reportsQueue = new Queue('reportsQueue', { connection });

export async function addReportJob(sessionId, data) {
  await reportsQueue.add('generate-report', { sessionId, ...data }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}
