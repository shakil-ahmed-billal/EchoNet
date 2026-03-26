import "dotenv/config";
import { Role, PostStatus, NotificationType } from '../generated/prisma/client/index.js';
import { prisma } from '../src/app/lib/prisma.js';
import { auth } from '../src/app/lib/auth.js';

async function main() {
  console.log('Seeding data...');

  const SEED_PASSWORD = 'shakil664';

  const userData = [
    {
      email: 'admin@echonet.app',
      name: 'Admin User',
      role: Role.ADMIN,
      bio: 'Platform Administrator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
    {
      email: 'mod@echonet.app',
      name: 'Moderator User',
      role: Role.MODERATOR,
      bio: 'Content Moderator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mod',
    },
    {
      email: 'user1@example.com',
      name: 'Sarah Jenkins',
      role: Role.USER,
      bio: 'Digital nomad and tech enthusiast.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      email: 'user2@example.com',
      name: 'Alex Dev',
      role: Role.USER,
      bio: 'Fullstack developer building the future.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  ];

  const seededUsers = [];

  for (const user of userData) {
    console.log(`Checking/Seeding user: ${user.email}`);
    
    // Check if user exists
    let existingUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { accounts: true }
    });

    if (!existingUser) {
      console.log(`Creating user: ${user.email} via better-auth API...`);
      try {
        const result = await auth.api.signUpEmail({
          body: {
            name: user.name,
            email: user.email,
            password: SEED_PASSWORD,
          }
        });

        if (result && result.user) {
          // Update the user with our specific metadata (role, bio, avatar)
          existingUser = await prisma.user.update({
            where: { id: result.user.id },
            data: {
              role: user.role,
              bio: user.bio,
              avatarUrl: user.avatarUrl,
            }
          });
        }
      } catch (error: any) {
        console.error(`Failed to seed user ${user.email}:`, error.message);
      }
    } else {
      console.log(`User ${user.email} already exists.`);
    }

    if (existingUser) seededUsers.push(existingUser);
  }

  if (seededUsers.length < 4) {
    console.warn('Some users were not found or created. Continuing with available users...');
  }

  const findUserByEmail = (email: string) => seededUsers.find(u => u.email === email);
  const admin = findUserByEmail('admin@echonet.app');
  const user1 = findUserByEmail('user1@example.com');
  const user2 = findUserByEmail('user2@example.com');

  if (!admin || !user1 || !user2) {
    console.error('Critical users missing. Seeding stopped.');
    return;
  }

  const userIds = seededUsers.map(u => u.id);

  // Clear existing related data to avoid foreign key violations
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.message.deleteMany({ where: { OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }] } });
  await prisma.like.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.comment.deleteMany({ where: { authorId: { in: userIds } } });
  await prisma.post.deleteMany({ where: { authorId: { in: userIds } } });

  // Create Posts
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
      content: 'Thanks Alex! This platform looks great.',
    },
  });

  const reply2 = await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: user1.id,
      content: 'Totally agree! v4 is a game changer.',
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
      content: 'Hey Alex, are we still on for the EchoNet launch?',
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
  });
