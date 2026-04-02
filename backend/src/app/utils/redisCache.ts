import { Request, Response, NextFunction } from 'express';
import redisClient from '../lib/redis.js';
import logger from './logger.js';
import sendResponse from './sendResponse.js';
import crypto from 'crypto';

// Default cache expiration in seconds
const DEFAULT_EXPIRATION = 60;

/**
 * Redis Cache Middleware
 * @param resource - The resource name (e.g., 'products', 'posts') for prefixing
 * @param duration - Cache TTL in seconds (default: 60)
 */
export const redisCache = (resource: string = 'general', duration: number = DEFAULT_EXPIRATION) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if redis is not connected or configured
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Generate a unique cache key based on the resource name and full URL
      const url = req.originalUrl || req.url;
      const hash = crypto.createHash('sha256').update(url).digest('hex');
      const cacheKey = `cache:${resource}:${hash}`;

      // Check if data exists in cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Return cached response
        const parsedData = JSON.parse(cachedData);
        return sendResponse(res, {
            ...parsedData,
            message: `${parsedData.message} (Cached)`
        });
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      
      res.json = (body: any) => {
          // Cache only successful responses (200-299)
          if (res.statusCode >= 200 && res.statusCode < 300 && redisClient?.isOpen) {
              redisClient.setEx(cacheKey, duration, JSON.stringify(body)).catch(err => {
                  logger.error(`Redis Cache Set Error [${cacheKey}]`, err);
              });
          }
          return originalJson(body);
      };

      next();
    } catch (error) {
        logger.error('Redis Cache Middleware Error', error);
        next();
    }
  };
};

/**
 * Clear cached items for a specific resource
 * @param resource - The resource name to clear (e.g., 'products')
 */
export const clearCache = async (resource: string) => {
    if (!redisClient || !redisClient.isOpen) return;

    try {
        const pattern = `cache:${resource}:*`;
        const keys = await redisClient.keys(pattern);
        
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info(`Redis Cache Cleared: ${resource} (${keys.length} keys)`);
        }
    } catch (error) {
        logger.error(`Redis Cache Clear Error for ${resource}`, error);
    }
};
