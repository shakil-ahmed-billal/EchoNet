import { prisma } from './src/app/lib/prisma.js';

async function main() {
    const sessions = await prisma.session.findMany();
    console.log("All Sessions:");
    console.dir(sessions, { depth: null });
    
    // Test hashing
    console.log("Session count:", sessions.length);
}

main().then(() => prisma.$disconnect()).catch(console.error);
