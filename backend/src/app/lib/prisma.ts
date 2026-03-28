import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client/index.js";
import config from '../config/index.js';

const rawDbUrl = config.database_url || "";
const formattedUrl = rawDbUrl.startsWith("postgres://") && rawDbUrl.includes("db.prisma.io") 
  ? rawDbUrl.replace(/^postgres:\/\//, "prisma://") 
  : rawDbUrl;

const prisma = new PrismaClient({
  accelerateUrl: formattedUrl,
  log: ['info', 'warn', 'error'],
});

export default prisma;
export { prisma };
