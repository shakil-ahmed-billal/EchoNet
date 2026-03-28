import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client/index.js";
import config from '../config/index.js';

import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: config.database_url,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });

export default prisma;
export { prisma };
