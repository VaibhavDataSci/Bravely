const { Queue } = require('bullmq');
const { REDIS_URL } = require('../config/env');
const IORedis = require('ioredis');

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const reportsQueue = new Queue('reportsQueue', { connection });

async function addReportJob(sessionId, data) {
  await reportsQueue.add('generate-report', { sessionId, ...data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

module.exports = {
  reportsQueue,
  addReportJob,
};
