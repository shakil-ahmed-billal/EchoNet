import { createClient } from 'redis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const redisClient = config.redis_url ? createClient({ url: config.redis_url }) : null;

if (redisClient) {
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
}

export const connectRedis = async () => {
    try {
        if (redisClient && !redisClient.isOpen) {
            await redisClient.connect();
            logger.info('Connected to Redis');
        }
    } catch (error) {
        logger.error('Could not connect to Redis. Some features may be limited.', error);
    }
};

export default redisClient;
