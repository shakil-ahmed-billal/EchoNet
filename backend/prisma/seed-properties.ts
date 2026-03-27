import "dotenv/config";
import { 
  ListingType, 
  PropertyStatus, 
  BookingStatus 
} from "../generated/prisma/client/index.js";
import prisma from "../src/app/lib/prisma.js";

async function main() {
  console.log("🏙️  Seeding Property Portal data...");

  // 1. Find Users
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ["sarah@example.com", "alex@example.com", "maya@example.com", "admin@echonet.app"]
      }
    }
  });

  const sarah = users.find(u => u.email === "sarah@example.com");
  const alex = users.find(u => u.email === "alex@example.com");
  const maya = users.find(u => u.email === "maya@example.com");
  const admin = users.find(u => u.email === "admin@echonet.app");

  if (!sarah || !alex || !maya || !admin) {
    console.error("❌ Required seed users not found. Please run the main seed first.");
    return;
  }

  // 2. Create Agent Profiles
  console.log("🛡️  Creating Agent Profiles...");
  const agentData = [
    { userId: alex.id, bio: "Expert in luxury apartments in Gulshan.", isVerified: true, licenseNo: "RE-12345", agencyName: "Gulshan Realty" },
    { userId: sarah.id, bio: "Digital nomad friendly rentals across Dhaka.", isVerified: true, licenseNo: "RE-54321", agencyName: "Sarah's Homes" },
    { userId: maya.id, bio: "Modern studio designer and agent.", isVerified: false, licenseNo: "RE-99999", agencyName: "Maya Studios" },
  ];

  for (const data of agentData) {
    await prisma.agentProfile.upsert({
      where: { userId: data.userId },
      update: data,
      create: data
    });
  }

  const alexAgent = await prisma.agentProfile.findUnique({ where: { userId: alex.id } });
  const sarahAgent = await prisma.agentProfile.findUnique({ where: { userId: sarah.id } });

  // 3. Create Properties
  console.log("🏠 Creating Properties...");
  const propertyData = [
    {
      ownerId: admin.id,
      agentId: alexAgent?.id,
      title: "Luxurious 3BR Penthouse in Gulshan 2",
      description: "Experience the pinnacle of luxury in this stunning penthouse. Featuring floor-to-ceiling windows, a private terrace, and state-of-the-art kitchen appliances. Located in the heart of Gulshan, this property offers unparalleled convenience and style.",
      price: 45000000,
      listingType: ListingType.SALE,
      category: "Apartment",
      city: "Dhaka",
      area: "Gulshan",
      address: "Road 72, Gulshan 2, Dhaka",
      status: PropertyStatus.ACTIVE,
      details: {
        create: {
          bedrooms: 3,
          bathrooms: 4,
          areaSqft: 2800,
          floorNo: 12,
          totalFloors: 14,
          parking: 2,
          facing: "South",
          furnished: "Full",
        }
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200", isCover: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200", isCover: false, order: 1 },
          { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200", isCover: false, order: 2 }
        ]
      },
      amenities: {
        create: [
          { name: "Gas" }, { name: "Water" }, { name: "Lift" }, { name: "Generator" }, { name: "Pool" }, { name: "Gym" }, { name: "Security" }
        ]
      }
    },
    {
      ownerId: sarah.id,
      agentId: sarahAgent?.id,
      title: "Cozy Studio near Banani 11",
      description: "Perfect for digital nomads and young professionals. This modern studio is fully furnished and includes high-speed internet. Walking distance to the best cafes and restaurants in Banani.",
      price: 35000,
      priceUnit: "PER_MONTH",
      listingType: ListingType.RENT,
      category: "Studio",
      city: "Dhaka",
      area: "Banani",
      address: "Road 11, Banani, Dhaka",
      status: PropertyStatus.ACTIVE,
      details: {
        create: {
          bedrooms: 1,
          bathrooms: 1,
          areaSqft: 650,
          floorNo: 4,
          totalFloors: 6,
          parking: 0,
          facing: "East",
          furnished: "Full",
        }
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200", isCover: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", isCover: false, order: 1 }
        ]
      },
      amenities: {
        create: [
          { name: "Gas" }, { name: "Water" }, { name: "Lift" }, { name: "Wifi" }, { name: "AC" }
        ]
      }
    },
    {
      ownerId: maya.id,
      title: "Spacious Duplex in Uttara Sector 4",
      description: "Beautiful family duplex with 4 bedrooms. Large living area and independent entrance. Quiet residential area with easy access to the airport.",
      price: 25000000,
      listingType: ListingType.SALE,
      category: "Duplex",
      city: "Dhaka",
      area: "Uttara",
      address: "Sector 4, Uttara, Dhaka",
      status: PropertyStatus.PENDING,
      details: {
        create: {
          bedrooms: 4,
          bathrooms: 4,
          areaSqft: 3200,
          floorNo: 1,
          totalFloors: 2,
          parking: 2,
          facing: "North",
          furnished: "Semi",
        }
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", isCover: true, order: 0 }
        ]
      },
      amenities: {
        create: [
          { name: "Gas" }, { name: "Water" }, { name: "Generator" }, { name: "Parking" }
        ]
      }
    }
  ];

  for (const data of propertyData) {
    await prisma.property.create({
      data: data as any
    });
  }

  const penthouse = await prisma.property.findFirst({ where: { title: { contains: "Penthouse" } } });
  const studio = await prisma.property.findFirst({ where: { title: { contains: "Studio" } } });

  // 4. Create Bookings
  console.log("📅 Creating Bookings...");
  if (penthouse && studio) {
    await prisma.booking.create({
      data: {
        propertyId: penthouse.id,
        userId: sarah.id,
        visitDate: new Date(Date.now() + 864e5 * 2),
        visitTime: "10:30 AM",
        message: "I am very interested in this penthouse. Looking forward to the visit.",
        status: BookingStatus.PENDING
      }
    });

    await prisma.booking.create({
      data: {
        propertyId: studio.id,
        userId: alex.id,
        visitDate: new Date(Date.now() + 864e5),
        visitTime: "4:00 PM",
        message: "Checking for a client. Please confirm the time.",
        status: BookingStatus.CONFIRMED
      }
    });
  }

  // 5. Create Enquiries
  console.log("📧 Creating Enquiries...");
  if (penthouse) {
    await prisma.propertyEnquiry.create({
      data: {
        propertyId: penthouse.id,
        senderId: maya.id,
        message: "Is the price negotiable? I have a direct buyer ready.",
        phone: "+8801700112233"
      }
    });
  }

  console.log("\n✅ Property Portal seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
