import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client/index.js";
import config from '../config/index.js';

const prisma = new PrismaClient({
  accelerateUrl: config.database_url,
  log: ['info', 'warn', 'error'],
});

export default prisma;
export { prisma };
