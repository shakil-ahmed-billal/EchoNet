import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client/index.js";

const prisma = new PrismaClient();

export default prisma;
export { prisma };
