import { Queue } from 'bullmq';
import { redisClient } from '../database/redis';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

/**
 * Cola principal para procesos de crédito.
 */
export const creditQueue = new Queue('credit-operations', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // Limpia Redis al terminar para ahorrar memoria 
    removeOnFail: false,   
  }
});