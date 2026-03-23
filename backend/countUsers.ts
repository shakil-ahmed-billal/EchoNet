import prisma from './src/app/lib/prisma.ts';

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Total users in DB: ${users.length}`);
  users.forEach(u => console.log(`User: ${u.name}, ID: ${u.id}`));

  const follows = await prisma.follow.findMany();
  console.log(`Total follow relations: ${follows.length}`);
  console.dir(follows);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
