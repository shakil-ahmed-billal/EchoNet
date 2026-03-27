import { BookingStatus } from '../../../../generated/prisma/client/index.js';
import prisma from '../../lib/prisma.js';

const createBooking = async (userId: string, payload: any) => {
  const { propertyId, visitDate, visitTime, message } = payload;

  const result = await prisma.booking.create({
    data: {
      propertyId,
      userId,
      visitDate: new Date(visitDate),
      visitTime,
      message,
    },
    include: {
      property: {
        select: { title: true, address: true, ownerId: true }
      }
    }
  });

  return result;
};

const getMyBookings = async (userId: string, role: string) => {
  // If user is owner, they see bookings for their properties
  // If user is visitor, they see bookings they made
  
  const bookingsAsVisitor = await prisma.booking.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: { where: { isCover: true } }
        }
      }
    },
    orderBy: { visitDate: 'desc' }
  });

  const bookingsAsOwner = await prisma.booking.findMany({
    where: {
      property: { ownerId: userId }
    },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      property: { select: { title: true, address: true } }
    },
    orderBy: { visitDate: 'desc' }
  });

  return { asVisitor: bookingsAsVisitor, asOwner: bookingsAsOwner };
};

const updateBookingStatus = async (id: string, userId: string, status: BookingStatus) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true }
  });

  if (!booking) throw new Error('Booking not found');

  // Only the property owner can confirm/complete. Visitor can cancel.
  const isOwner = booking.property.ownerId === userId;
  const isVisitor = booking.userId === userId;

  if (status === BookingStatus.CANCELLED && !isVisitor && !isOwner) {
    throw new Error('Not authorized to cancel this booking');
  }

  if ((status === BookingStatus.CONFIRMED || status === BookingStatus.DONE) && !isOwner) {
    throw new Error('Only the property owner can update this status');
  }

  return await prisma.booking.update({
    where: { id },
    data: { status }
  });
};

export const BookingServices = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
