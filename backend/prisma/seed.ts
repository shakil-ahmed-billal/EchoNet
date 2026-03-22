import { PrismaClient, Role, PostStatus, NotificationType } from '../src/generated/prisma/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import "dotenv/config";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@echonet.app' },
    update: {},
    create: {
      email: 'admin@echonet.app',
      name: 'Admin User',
      role: Role.ADMIN,
      bio: 'Platform Administrator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'mod@echonet.app' },
    update: {},
    create: {
      email: 'mod@echonet.app',
      name: 'Moderator User',
      role: Role.MODERATOR,
      bio: 'Content Moderator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mod',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Sarah Jenkins',
      role: Role.USER,
      bio: 'Digital nomad and tech enthusiast.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Alex Dev',
      role: Role.USER,
      bio: 'Fullstack developer building the future.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  });

  console.log('Users seeded.');

  // 2. Create Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      content: 'Just setting up my EchoNet profile! Excited to be here ✨ #firstpost',
      status: PostStatus.ACTIVE,
      likesCount: 2,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      content: 'Building responsive layouts with Tailwind v4 is amazing. The new features really speed up development. #coding #nextjs',
      status: PostStatus.ACTIVE,
      likesCount: 1,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: admin.id,
      content: 'Welcome to EchoNet! Please follow the community guidelines and have fun. #announcement',
      status: PostStatus.ACTIVE,
      likesCount: 5,
    },
  });

  console.log('Posts seeded.');

  // 3. Create Comments
  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      content: 'Welcome to the platform, Sarah!',
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: admin.id,
      content: 'Glad to have you here!',
    },
  });

  const reply1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user1.id,
      parentId: comment1.id,
      content: 'Thanks Alex!',
    },
  });

  console.log('Comments seeded.');

  // 4. Create Likes
  await prisma.like.create({
    data: { userId: user2.id, postId: post1.id },
  });
  await prisma.like.create({
    data: { userId: admin.id, postId: post1.id },
  });
  await prisma.like.create({
    data: { userId: user1.id, postId: post2.id },
  });

  console.log('Likes seeded.');

  // 5. Create Messages
  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      content: 'Hey Alex, are we still on for the meeting?',
    },
  });

  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: user1.id,
      content: 'Yes absolutely! I\'ll be there in 10 mins.',
      isRead: true,
    },
  });

  console.log('Messages seeded.');

  // 6. Create Notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: NotificationType.LIKE,
      referenceId: post1.id,
      message: 'Alex Dev liked your post',
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: NotificationType.COMMENT,
      referenceId: comment1.id,
      message: 'Alex Dev commented: "Welcome to the platform, Sarah!"',
    },
  });

  console.log('Notifications seeded.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
