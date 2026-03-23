import prisma from './src/app/lib/prisma.ts';

async function main() {
  const notifications = await prisma.notification.findMany({ take: 1 });
  if (notifications.length === 0) {
    console.log("No notifications in DB.");
    return;
  }
  const notif = notifications[0];
  console.log(`Found notification: ${notif.id}`);
  
  try {
     const res = await fetch(`http://localhost:8000/api/v1/notifications/${notif.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
     });
     console.log(`HTTP Status: ${res.status}`);
     const text = await res.text();
     console.log(`Response: ${text}`);
  } catch (error) {
     console.error("Fetch failed:", error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
