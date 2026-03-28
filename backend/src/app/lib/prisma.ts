import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client/index.js";
import config from '../config/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.database_url,
  ssl: { rejectUnauthorized: false },
  // Robust settings for Vercel/Serverless
  connectionTimeoutMillis: 10000, // 10s wait for new connections
  idleTimeoutMillis: 30000,      // 30s before closing idle connections
  max: 10,                       // Limit concurrent connections per function instance
});

const adapter = new PrismaPg(pool as any);

// Singleton pattern for PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter, log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
