import prisma from '../../lib/prisma.js';

const sendEnquiry = async (senderId: string, payload: any) => {
  const { propertyId, message, phone } = payload;

  return await prisma.propertyEnquiry.create({
    data: {
      propertyId,
      senderId,
      message,
      phone,
    },
    include: {
      property: { select: { title: true, ownerId: true } }
    }
  });
};

const getMyEnquiries = async (userId: string) => {
  // Enquiries received as an owner
  const received = await prisma.propertyEnquiry.findMany({
    where: {
       property: { ownerId: userId }
    },
    include: {
      sender: { select: { name: true, avatarUrl: true, email: true } },
      property: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Enquiries sent as a potential buyer
  const sent = await prisma.propertyEnquiry.findMany({
    where: { senderId: userId },
    include: {
      property: {
        select: { title: true, ownerId: true },
        include: {
          owner: { select: { name: true, avatarUrl: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return { received, sent };
};

const markAsRead = async (id: string, userId: string) => {
  const enquiry = await prisma.propertyEnquiry.findUnique({
    where: { id },
    include: { property: true }
  });

  if (!enquiry || enquiry.property.ownerId !== userId) {
    throw new Error('Not authorized');
  }

  return await prisma.propertyEnquiry.update({
    where: { id },
    data: { isRead: true }
  });
};

export const EnquiryServices = {
  sendEnquiry,
  getMyEnquiries,
  markAsRead,
};
