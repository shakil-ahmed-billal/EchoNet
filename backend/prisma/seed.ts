import "dotenv/config";
import {
  Role,
  PostStatus,
  NotificationType,
  ReactionType,
  FollowStatus,
  ProductStatus,
} from "../generated/prisma/client/index.js";
import { prisma } from "../src/app/lib/prisma.js";
import { auth } from "../src/app/lib/auth.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 864e5);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "shakil664";

const USER_DATA = [
  {
    email: "admin@echonet.app",
    name: "Admin User",
    role: Role.ADMIN,
    bio: "Platform Administrator | Keeping EchoNet safe & awesome 🛡️",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    location: "San Francisco, CA",
    website: "https://echonet.app",
  },
  {
    email: "mod@echonet.app",
    name: "Mia Moderator",
    role: Role.MODERATOR,
    bio: "Content Moderator | here to ensure quality 🎯",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mod",
    location: "New York, NY",
    website: "",
  },
  {
    email: "sarah@example.com",
    name: "Sarah Jenkins",
    role: Role.USER,
    bio: "Digital nomad ✈️ | Travel blogger | Coffee addict ☕",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    location: "Bali, Indonesia",
    website: "https://sarah.blog",
  },
  {
    email: "alex@example.com",
    name: "Alex Dev",
    role: Role.USER,
    bio: "Fullstack developer 🚀 | Open-source contributor | Next.js fanatic",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    location: "London, UK",
    website: "https://alexdev.io",
  },
  {
    email: "maya@example.com",
    name: "Maya Patel",
    role: Role.USER,
    bio: "UI/UX Designer 🎨 | Building beautiful things | Figma power user",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    location: "Mumbai, India",
    website: "",
  },
  {
    email: "james@example.com",
    name: "James Carter",
    role: Role.USER,
    bio: "Entrepreneur | Founder of @StartupLab | Building in public 💡",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    location: "Austin, TX",
    website: "https://startuplab.io",
  },
  {
    email: "lena@example.com",
    name: "Lena Müller",
    role: Role.USER,
    bio: "Photographer 📸 | Capturing moments | Berlin-based",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena",
    location: "Berlin, Germany",
    website: "https://lena.photos",
  },
  {
    email: "kai@example.com",
    name: "Kai Tanaka",
    role: Role.USER,
    bio: "ML Engineer 🤖 | AI enthusiast | PyTorch all day",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai",
    location: "Tokyo, Japan",
    website: "",
  },
  {
    email: "priya@example.com",
    name: "Priya Sharma",
    role: Role.USER,
    bio: "Data Scientist 📊 | Python lover | Yoga practitioner 🧘",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    location: "Bangalore, India",
    website: "",
  },
  {
    email: "omar@example.com",
    name: "Omar Hassan",
    role: Role.USER,
    bio: "Backend Engineer | Rust & Go | Building APIs that don't break 🔧",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
    location: "Dubai, UAE",
    website: "",
  },
  {
    email: "chloe@example.com",
    name: "Chloe Laurent",
    role: Role.USER,
    bio: "Content Creator | Fashion & Lifestyle 💄 | Paris vibes",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
    location: "Paris, France",
    website: "https://chloelaurent.fr",
  },
  {
    email: "ryan@example.com",
    name: "Ryan Brooks",
    role: Role.USER,
    bio: "Gamer 🎮 | Streamer | Coffee + Code + Games = Life",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
    location: "Toronto, Canada",
    website: "",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting comprehensive seed...\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("👥 Seeding users...");
  const seededUsers: any[] = [];

  for (const user of USER_DATA) {
    let existing = await prisma.user.findUnique({ where: { email: user.email } });

    if (!existing) {
      try {
        const result = await auth.api.signUpEmail({
          body: { name: user.name, email: user.email, password: SEED_PASSWORD },
        });
        if (result?.user) {
          existing = await prisma.user.update({
            where: { id: result.user.id },
            data: {
              role: user.role,
              bio: user.bio,
              avatarUrl: user.avatarUrl,
              location: user.location,
              website: user.website || null,
              emailVerified: true,
            },
          });
          console.log(`  ✅ Created: ${user.email}`);
        }
      } catch (e: any) {
        console.error(`  ❌ Failed: ${user.email} — ${e.message}`);
      }
    } else {
      console.log(`  ♻️  Exists: ${user.email}`);
    }
    if (existing) seededUsers.push(existing);
  }

  const byEmail = (email: string) => seededUsers.find((u) => u.email === email)!;
  const admin = byEmail("admin@echonet.app");
  const mod = byEmail("mod@echonet.app");
  const sarah = byEmail("sarah@example.com");
  const alex = byEmail("alex@example.com");
  const maya = byEmail("maya@example.com");
  const james = byEmail("james@example.com");
  const lena = byEmail("lena@example.com");
  const kai = byEmail("kai@example.com");
  const priya = byEmail("priya@example.com");
  const omar = byEmail("omar@example.com");
  const chloe = byEmail("chloe@example.com");
  const ryan = byEmail("ryan@example.com");
  const allUsers = [admin, mod, sarah, alex, maya, james, lena, kai, priya, omar, chloe, ryan].filter(Boolean);

  // ── 2. Wipe existing seeded content ───────────────────────────────────────
  console.log("\n🗑️  Clearing old seeded content...");
  const ids = allUsers.map((u) => u.id);
  await prisma.productReview.deleteMany({});
  await prisma.productFlag.deleteMany({});
  await prisma.storeFollow.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.storyView.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.savedPost.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.postHashtag.deleteMany({});
  await prisma.hashtag.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.follow.deleteMany({});
  console.log("  ✅ Done");

  // ── 3. Follow Graph ────────────────────────────────────────────────────────
  console.log("\n🤝 Creating follow relationships...");
  const followPairs: [any, any][] = [
    [alex, sarah], [sarah, alex],
    [maya, sarah], [sarah, maya],
    [james, alex], [alex, james],
    [kai, alex], [omar, alex],
    [priya, maya], [maya, priya],
    [lena, chloe], [chloe, lena],
    [ryan, kai], [kai, ryan],
    [omar, james], [james, omar],
    [admin, sarah], [admin, alex],
    [mod, maya], [mod, james],
    [sarah, lena], [lena, sarah],
    [sarah, chloe], [chloe, sarah],
    [alex, kai], [kai, priya],
    [priya, omar], [ryan, james],
    [james, lena], [chloe, maya],
  ];

  for (const [follower, following] of followPairs) {
    if (!follower || !following) continue;
    try {
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: following.id,
          status: FollowStatus.ACCEPTED,
        },
      });
    } catch {}
  }

  // Update counts
  for (const u of allUsers) {
    const [fc, fwc] = await Promise.all([
      prisma.follow.count({ where: { followingId: u.id, status: FollowStatus.ACCEPTED } }),
      prisma.follow.count({ where: { followerId: u.id, status: FollowStatus.ACCEPTED } }),
    ]);
    await prisma.user.update({
      where: { id: u.id },
      data: { followersCount: fc, followingCount: fwc },
    });
  }
  console.log("  ✅ Follow graph created");

  // ── 4. Hashtags ────────────────────────────────────────────────────────────
  console.log("\n#️⃣  Creating hashtags...");
  const hashtagNames = [
    "coding", "webdev", "nextjs", "typescript", "ai", "machinelearning",
    "photography", "travel", "design", "ux", "startup", "buildinpublic",
    "echonet", "firstpost", "motivation", "lifestyle", "fashion", "gaming",
    "python", "react", "openai", "tech", "developer", "creator",
  ];
  const hashtagMap: Record<string, any> = {};
  for (const tag of hashtagNames) {
    hashtagMap[tag] = await prisma.hashtag.create({ data: { tag } });
  }
  console.log("  ✅ Hashtags created");

  // ── 5. Posts ───────────────────────────────────────────────────────────────
  console.log("\n📝 Creating posts...");

  const postDefs: {
    author: any;
    content: string;
    tags: string[];
    mediaUrls?: string[];
    likesCount?: number;
  }[] = [
    {
      author: admin,
      content: "Welcome to EchoNet! 🎉 This is the next-generation social platform built for creators, developers, and everyone in between. Make sure to read our community guidelines and enjoy! #echonet #announcement",
      tags: ["echonet"],
      likesCount: 42,
    },
    {
      author: sarah,
      content: "Just landed in Bali 🌴 The sunsets here are absolutely breathtaking. Living the dream! ✈️ #travel #lifestyle",
      tags: ["travel", "lifestyle"],
      mediaUrls: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"],
      likesCount: 38,
    },
    {
      author: alex,
      content: "Hot take 🔥: Bun is going to kill Node.js within 3 years. The performance gains are just too significant. Change my mind. #coding #webdev #typescript",
      tags: ["coding", "webdev", "typescript"],
      likesCount: 55,
    },
    {
      author: maya,
      content: "Just shipped a full design system in Figma for a fintech client! 💼 Clean, accessible, and ready for dev handoff. The secret? Consistent spacing tokens from day one. #design #ux",
      tags: ["design", "ux"],
      mediaUrls: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"],
      likesCount: 29,
    },
    {
      author: james,
      content: "Month 3 of building in public 📊 We hit 1,000 paying customers! 🎉 Revenue: $4,200 MRR. Churn: 2.1%. What a ride. #startup #buildinpublic",
      tags: ["startup", "buildinpublic"],
      likesCount: 81,
    },
    {
      author: lena,
      content: "Golden hour hits different when you're on a rooftop in Berlin 📸 Shot with my Sony A7IV, f/1.8, 1/800s. #photography",
      tags: ["photography"],
      mediaUrls: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
      ],
      likesCount: 94,
    },
    {
      author: kai,
      content: "GPT-4o fine-tuning results are wild. On our domain-specific dataset we went from 62% accuracy to 91% 🤯 The key was quality > quantity in the training data. #ai #machinelearning #openai",
      tags: ["ai", "machinelearning", "openai"],
      likesCount: 120,
    },
    {
      author: priya,
      content: "Pandas 2.0 + PyArrow backend = 3x faster dataframe operations. If you're still on 1.x you're leaving performance on the table. Quick migration guide 🧵👇 #python #tech",
      tags: ["python", "tech"],
      likesCount: 67,
    },
    {
      author: omar,
      content: "Migrating from REST to gRPC in production is terrifying but worth it. Latency dropped from 120ms to 18ms. If you're building microservices, look into it! #coding #developer",
      tags: ["coding", "developer"],
      likesCount: 44,
    },
    {
      author: chloe,
      content: "Paris Fashion Week was absolutely insane this year. The Karl Lagerfeld tribute collection made me cry 😭✨ #fashion #lifestyle",
      tags: ["fashion", "lifestyle"],
      mediaUrls: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800"],
      likesCount: 73,
    },
    {
      author: ryan,
      content: "Elden Ring DLC Shadow of the Erdtree: 10/10. FromSoftware cooked. Spent 90 hours and still discovering new areas. If you gave up — go back right now. #gaming",
      tags: ["gaming"],
      likesCount: 58,
    },
    {
      author: sarah,
      content: "Morning routine: Yoga at 6am, journaling, then 2 hours of deep work before breakfast. Changed my life completely. What's yours? 🌅 #motivation #lifestyle",
      tags: ["motivation", "lifestyle"],
      likesCount: 34,
    },
    {
      author: alex,
      content: "PSA: Please stop using useEffect for data fetching in 2024. React Query, SWR, or React 19 `use()` hook are all better alternatives. Your future self will thank you. #react #webdev",
      tags: ["react", "webdev"],
      likesCount: 89,
    },
    {
      author: maya,
      content: "Accessibility is not an afterthought. 61M adults in the US have a disability. Build for them from the start, not at the end. #design #ux #developer",
      tags: ["design", "ux", "developer"],
      likesCount: 47,
    },
    {
      author: james,
      content: "The #1 mistake I see founders make: building in stealth for 12 months before launching. Ship it ugly. Get feedback. Iterate. Speed wins. #startup #motivation #buildinpublic",
      tags: ["startup", "motivation", "buildinpublic"],
      likesCount: 103,
    },
    {
      author: lena,
      content: "New portrait series: 'Faces of Berlin' 🖤 Documenting the incredible diversity of this city, one face at a time. DM me if you want to be part of it! #photography #creator",
      tags: ["photography", "creator"],
      mediaUrls: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800"],
      likesCount: 61,
    },
    {
      author: kai,
      content: "I built a RAG pipeline that ingests Confluence, Notion, and Slack in real-time. Zero hallucinations on internal queries. Happy to open-source if there's interest 🙋 #ai #openai #developer",
      tags: ["ai", "openai", "developer"],
      likesCount: 145,
    },
    {
      author: priya,
      content: "Just got promoted to Senior Data Scientist! 🎊 For everyone grinding — keep going. It always feels impossible until it's done. #motivation #tech",
      tags: ["motivation", "tech"],
      likesCount: 212,
    },
    {
      author: omar,
      content: "Writing Rust after 5 years of Go. The borrow checker is genuinely teaching me how memory works at a deeper level. Painful but eye-opening. #coding #developer",
      tags: ["coding", "developer"],
      likesCount: 51,
    },
    {
      author: chloe,
      content: "Finally got my hands on the new Chanel bag 👜✨ Is it overpriced? Yes. Do I regret it? Absolutely not. Treat yourself, life is short. #fashion #lifestyle",
      tags: ["fashion", "lifestyle"],
      mediaUrls: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
      likesCount: 88,
    },
    {
      author: ryan,
      content: "Hot take: single-player games with great stories are the peak of the medium. Multiplayer is fun but nothing hits like a good narrative. #gaming #creator",
      tags: ["gaming", "creator"],
      likesCount: 36,
    },
    {
      author: mod,
      content: "Friendly reminder: EchoNet is a space for everyone. Hate speech, harassment, and spam will result in immediate suspension. Let's keep it positive 💛 #echonet",
      tags: ["echonet"],
      likesCount: 28,
    },
    {
      author: sarah,
      content: "Remote work tip: find a co-working space you love, not just for the wifi, but for the energy. The right environment is everything. 💻☕ #lifestyle #motivation #creator",
      tags: ["lifestyle", "motivation", "creator"],
      likesCount: 41,
    },
    {
      author: alex,
      content: "New blog post: How I built a type-safe API in under 100 lines using Zod + Express + Prisma. Zero runtime type errors. Link in bio 👇 #typescript #webdev #nextjs",
      tags: ["typescript", "webdev", "nextjs"],
      likesCount: 77,
    },
    {
      author: james,
      content: "We raised our seed round 🚀 $800K from angels who actually get what we're building. Cannot wait to share what's coming. Big things ahead. Stay tuned! #startup #buildinpublic",
      tags: ["startup", "buildinpublic"],
      likesCount: 199,
    },
  ];

  const posts: any[] = [];
  for (const def of postDefs) {
    const post = await prisma.post.create({
      data: {
        authorId: def.author.id,
        content: def.content,
        status: PostStatus.ACTIVE,
        likesCount: def.likesCount ?? 0,
        mediaUrls: def.mediaUrls ?? [],
        createdAt: daysAgo(Math.floor(Math.random() * 14)),
      },
    });

    // Attach hashtags
    for (const tag of def.tags) {
      if (hashtagMap[tag]) {
        await prisma.postHashtag.create({
          data: { postId: post.id, hashtagId: hashtagMap[tag].id },
        });
        await prisma.hashtag.update({
          where: { id: hashtagMap[tag].id },
          data: { postCount: { increment: 1 } },
        });
      }
    }
    posts.push(post);
  }
  console.log(`  ✅ ${posts.length} posts created`);

  // ── 6. Likes on posts ─────────────────────────────────────────────────────
  console.log("\n❤️  Creating likes...");
  let likeCount = 0;
  for (const post of posts) {
    const likers = pickN(
      allUsers.filter((u) => u.id !== post.authorId),
      Math.min(Math.floor(Math.random() * 8) + 2, allUsers.length - 1)
    );
    for (const liker of likers) {
      try {
        await prisma.like.create({ data: { userId: liker.id, postId: post.id } });
        likeCount++;
      } catch {}
    }
  }
  console.log(`  ✅ ${likeCount} likes created`);

  // ── 7. Reactions on posts ─────────────────────────────────────────────────
  console.log("\n😍 Creating reactions...");
  const reactionTypes = [
    ReactionType.LOVE, ReactionType.HAHA, ReactionType.WOW,
    ReactionType.LIKE, ReactionType.SAD, ReactionType.ANGRY,
  ];
  let reactCount = 0;
  for (const post of pickN(posts, 16)) {
    const reactors = pickN(allUsers.filter((u) => u.id !== post.authorId), 4);
    for (const reactor of reactors) {
      try {
        await prisma.reaction.create({
          data: { userId: reactor.id, postId: post.id, type: pick(reactionTypes) },
        });
        reactCount++;
      } catch {}
    }
  }
  console.log(`  ✅ ${reactCount} reactions created`);

  // ── 8. Comments & Replies ─────────────────────────────────────────────────
  console.log("\n💬 Creating comments and replies...");
  const commentTexts = [
    "This is incredible! 🔥",
    "Totally agree with everything here.",
    "Thanks for sharing this! Really helpful.",
    "I had no idea, mind blown 🤯",
    "This is exactly what I needed to read today.",
    "Couldn't agree more. Well said!",
    "The photos are stunning btw 😍",
    "Bookmarking this for later 🔖",
    "Love your content, keep it up!",
    "Have you written more about this? Would love a deep dive.",
    "Tag me if you do a follow-up!",
    "Been following you for a while, this might be your best post yet.",
    "This needs more attention! Sharing with my network.",
    "I was thinking the same thing last week!",
    "Absolute banger 🎯",
    "The dedication is inspiring 💪",
    "Wait, this is free? Link in bio?",
    "You always drop the best content at the right time.",
    "This aged well 😂",
    "First! And also — amazing post 🙌",
  ];
  const replyTexts = [
    "Totally agree with you!",
    "Same experience here 😄",
    "You took the words right out of my mouth.",
    "Exactly what I was thinking!",
    "💯 this",
    "Needed to hear this today, thank you.",
    "I'm going to try this approach.",
    "Haha yes! I've been there!",
    "Great point actually 👏",
  ];

  let commentCount = 0;
  let replyCount = 0;
  for (const post of posts) {
    const commentors = pickN(
      allUsers.filter((u) => u.id !== post.authorId),
      Math.floor(Math.random() * 5) + 2
    );
    const topComments: any[] = [];

    for (const commentor of commentors) {
      const comment = await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: commentor.id,
          content: pick(commentTexts),
          createdAt: daysAgo(Math.floor(Math.random() * 7)),
        },
      });
      topComments.push(comment);
      commentCount++;
    }

    // Add 1-3 replies per post (to random top comments)
    const numReplies = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numReplies && topComments.length > 0; i++) {
      const parentComment = pick(topComments);
      const replier = pick(allUsers.filter((u) => u.id !== parentComment.authorId));
      if (!replier) continue;
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: replier.id,
          parentId: parentComment.id,
          content: pick(replyTexts),
          createdAt: daysAgo(Math.floor(Math.random() * 5)),
        },
      });
      replyCount++;
    }
  }
  console.log(`  ✅ ${commentCount} comments + ${replyCount} replies created`);

  // ── 9. Saved Posts ────────────────────────────────────────────────────────
  console.log("\n🔖 Creating saved posts...");
  let savedCount = 0;
  for (const user of allUsers) {
    const toSave = pickN(posts.filter((p) => p.authorId !== user.id), Math.floor(Math.random() * 5) + 2);
    for (const post of toSave) {
      try {
        await prisma.savedPost.create({ data: { userId: user.id, postId: post.id } });
        savedCount++;
      } catch {}
    }
  }
  console.log(`  ✅ ${savedCount} saved posts created`);

  // ── 10. Stories ───────────────────────────────────────────────────────────
  console.log("\n📷 Creating stories...");
  const storyMediaUrls = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
    "https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?w=800",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    "https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800",
  ];
  const storyCaptions = [
    "Starting the day right ☀️",
    "Vibes only ✨",
    "Living in the moment 🌊",
    "New day, new adventures 🗺️",
    "Coffee first, everything else later ☕",
    "Making memories that last 📸",
    "The best is yet to come 🚀",
    "Good energy only 💛",
  ];

  const createdStories: any[] = [];
  for (const user of allUsers) {
    const numStories = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numStories; i++) {
      const story = await prisma.story.create({
        data: {
          authorId: user.id,
          mediaUrl: pick(storyMediaUrls),
          caption: pick(storyCaptions),
          expiresAt: new Date(Date.now() + 864e5), // 24h from now
          createdAt: new Date(Date.now() - Math.random() * 864e4),
        },
      });
      createdStories.push({ ...story, authorId: user.id });
    }
  }

  // Story views
  let viewCount = 0;
  for (const story of createdStories) {
    const viewers = pickN(allUsers.filter((u) => u.id !== story.authorId), Math.floor(Math.random() * 6) + 2);
    for (const viewer of viewers) {
      try {
        await prisma.storyView.create({ data: { storyId: story.id, viewerId: viewer.id } });
        viewCount++;
      } catch {}
    }
  }
  console.log(`  ✅ ${createdStories.length} stories + ${viewCount} views created`);

  // ── 11. Direct Messages ───────────────────────────────────────────────────
  console.log("\n✉️  Creating messages...");
  const convoTexts = [
    ["Hey! Loved your last post 👍", "Thanks so much! Really appreciate it 😊", "We should collab sometime!", "100%! DM me your ideas 🤝"],
    ["Did you see the news about OpenAI?", "Yes!! Wild stuff. The pace of change is insane.", "Are you using GPT-4o in your projects?", "All the time. It's a game changer for sure."],
    ["Your photography is on another level 🔥", "You're too kind! It's just practice haha", "Any tips for a beginner?", "Start shooting in manual mode. It's scary at first but worth it!"],
    ["The new startup numbers you shared are inspiring", "It's been a tough road but worth every second!", "Any lessons for early-stage founders?", "Find your first 10 customers before writing a single line of code."],
    ["I tried that Rust thing you mentioned", "And? What did you think?", "Genuinely painful but I get why people love it 😅", "Yeah the learning curve is steep but you'll thank yourself later!"],
  ];

  const convoPairs: [any, any][] = [
    [sarah, alex], [alex, maya], [lena, chloe],
    [james, omar], [kai, priya],
  ];

  let msgCount = 0;
  for (let i = 0; i < convoPairs.length; i++) {
    const [u1, u2] = convoPairs[i];
    const texts = convoTexts[i % convoTexts.length];
    for (let j = 0; j < texts.length; j++) {
      const sender = j % 2 === 0 ? u1 : u2;
      const receiver = j % 2 === 0 ? u2 : u1;
      await prisma.message.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          content: texts[j],
          isRead: j < texts.length - 1,
          createdAt: new Date(Date.now() - (texts.length - j) * 600000),
        },
      });
      msgCount++;
    }
  }
  console.log(`  ✅ ${msgCount} messages created`);

  // ── 12. Notifications ─────────────────────────────────────────────────────
  console.log("\n🔔 Creating notifications...");
  const notifDefs: { userId: string; type: NotificationType; message: string; refId?: string }[] = [
    { userId: sarah.id, type: NotificationType.FOLLOW, message: "Alex Dev started following you" },
    { userId: alex.id, type: NotificationType.LIKE, message: "Maya Patel liked your post", refId: posts[2]?.id },
    { userId: james.id, type: NotificationType.COMMENT, message: "Omar Hassan commented on your post", refId: posts[4]?.id },
    { userId: kai.id, type: NotificationType.LIKE, message: "Priya Sharma liked your post", refId: posts[6]?.id },
    { userId: priya.id, type: NotificationType.FOLLOW, message: "Kai Tanaka started following you" },
    { userId: lena.id, type: NotificationType.LIKE, message: "Chloe Laurent liked your post", refId: posts[5]?.id },
    { userId: chloe.id, type: NotificationType.COMMENT, message: "Sarah Jenkins commented on your post", refId: posts[9]?.id },
    { userId: omar.id, type: NotificationType.FOLLOW, message: "James Carter started following you" },
    { userId: ryan.id, type: NotificationType.LIKE, message: "Kai Tanaka liked your post", refId: posts[10]?.id },
    { userId: sarah.id, type: NotificationType.COMMENT, message: "Admin User commented on your post", refId: posts[1]?.id },
    { userId: maya.id, type: NotificationType.REPLY, message: "Priya Sharma replied to your comment" },
    { userId: alex.id, type: NotificationType.MENTION, message: "Omar Hassan mentioned you in a post" },
    { userId: james.id, type: NotificationType.LIKE, message: "Ryan Brooks liked your post", refId: posts[14]?.id },
    { userId: kai.id, type: NotificationType.COMMENT, message: "Alex Dev commented on your post", refId: posts[16]?.id },
    { userId: lena.id, type: NotificationType.FOLLOW, message: "Sarah Jenkins started following you" },
    { userId: admin.id, type: NotificationType.ANNOUNCEMENT, message: "Platform update: 1,000 users reached! 🎉" },
  ];

  for (const n of notifDefs) {
    if (!n.userId) continue;
    await prisma.notification.create({
      data: {
        userId: n.userId,
        type: n.type,
        message: n.message,
        referenceId: n.refId ?? null,
        isRead: Math.random() > 0.5,
        createdAt: daysAgo(Math.floor(Math.random() * 7)),
      },
    });
  }
  console.log(`  ✅ ${notifDefs.length} notifications created`);

  // ── 13. Marketplace ────────────────────────────────────────────────────────
  console.log("\n🛒 Seeding Marketplace...");

  // 13.1 Categories
  const categoriesData = [
    { name: "Electronics", slug: "electronics", iconUrl: "https://api.iconify.design/lucide:cpu.svg" },
    { name: "Fashion", slug: "fashion", iconUrl: "https://api.iconify.design/lucide:shirt.svg" },
    { name: "Home & Living", slug: "home-living", iconUrl: "https://api.iconify.design/lucide:home.svg" },
    { name: "Books", slug: "books", iconUrl: "https://api.iconify.design/lucide:book-open.svg" },
    { name: "Sports", slug: "sports", iconUrl: "https://api.iconify.design/lucide:trophy.svg" },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        iconUrl: cat.iconUrl,
        createdBy: admin.id,
      }
    });
    createdCategories.push(category);
  }
  console.log(`  ✅ ${createdCategories.length} categories created`);

  // 13.2 Stores for Alex, Sarah, and Maya
  const storeOwners = [alex, sarah, maya];
  const createdStores = [];
  for (const owner of storeOwners) {
    const store = await prisma.store.upsert({
      where: { ownerId: owner.id },
      update: {},
      create: {
        ownerId: owner.id,
        name: `${owner.name}'s Shop`,
        description: `Premium items curated by ${owner.name}. Welcome to our store!`,
        logoUrl: owner.avatarUrl,
        bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      }
    });
    createdStores.push(store);
  }
  console.log(`  ✅ ${createdStores.length} stores created`);

  // 13.3 Products
  const productsData = [
    { 
      title: "MacBook Pro M3", 
      description: "The most powerful MacBook yet with the blazing fast M3 chip.", 
      price: 1999.99, 
      categorySlug: "electronics", 
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"] 
    },
    { 
      title: "Sony WH-1000XM5", 
      description: "Industry-leading noise canceling headphones from Sony.", 
      price: 349.99, 
      categorySlug: "electronics", 
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"] 
    },
    { 
      title: "Designer Hoodie", 
      description: "Comfortable and stylish oversized hoodie for everyday wear.", 
      price: 89.99, 
      categorySlug: "fashion", 
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"] 
    },
    { 
      title: "Clean Code Handbook", 
      description: "A must-read for every professional software developer.", 
      price: 45.00, 
      categorySlug: "books", 
      images: ["https://images.unsplash.com/photo-1589998059171-988d887df646?w=800"] 
    },
    { 
      title: "Ergonomic Office Chair", 
      description: "Stay productive and healthy with our premium office chair.", 
      price: 299.00, 
      categorySlug: "home-living", 
      images: ["https://images.unsplash.com/photo-1505797149-43b0020ee76e?w=800"] 
    },
    { 
      title: "Yoga Mat", 
      description: "Eco-friendly natural rubber yoga mat with superior grip.", 
      price: 65.00, 
      categorySlug: "sports", 
      images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"] 
    },
  ];

  let productCount = 0;
  for (const store of createdStores) {
    for (const prod of productsData) {
      const category = createdCategories.find(c => c.slug === prod.categorySlug);
      if (!category) continue;
      
      await prisma.product.create({
        data: {
          storeId: store.id,
          categoryId: category.id,
          title: `${store.name} - ${prod.title}`,
          description: prod.description,
          price: prod.price,
          stock: 10,
          images: prod.images,
          status: ProductStatus.ACTIVE,
        }
      });
      productCount++;
    }
  }
  console.log(`  ✅ ${productCount} products created`);


  // ── 13. Update post counts ─────────────────────────────────────────────────
  for (const user of allUsers) {
    const count = await prisma.post.count({ where: { authorId: user.id } });
    await prisma.user.update({ where: { id: user.id }, data: { postsCount: count } });
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅ Seeding complete! Summary:");
  console.log(`   👥 Users:         ${allUsers.length}`);
  console.log(`   📝 Posts:         ${posts.length}`);
  console.log(`   ❤️  Likes:         ${likeCount}`);
  console.log(`   😍 Reactions:     ${reactCount}`);
  console.log(`   💬 Comments:      ${commentCount}`);
  console.log(`   ↩️  Replies:       ${replyCount}`);
  console.log(`   🔖 Saved Posts:   ${savedCount}`);
  console.log(`   📷 Stories:       ${createdStories.length}`);
  console.log(`   ✉️  Messages:      ${msgCount}`);
  console.log(`   🔔 Notifications: ${notifDefs.length}`);
  console.log(`   #️⃣  Hashtags:      ${hashtagNames.length}`);
  console.log(`\n🔑 All users password: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
