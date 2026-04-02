import { ListingType, PropertyStatus } from '../../../../generated/prisma/client/index.js';
import prisma from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/QueryBuilder.js';

const createProperty = async (userId: string, payload: any) => {
  const {
    title,
    description,
    price,
    priceUnit,
    listingType,
    category,
    city,
    area,
    address,
    latitude,
    longitude,
    details,
    images,
    amenities,
  } = payload;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Property
    const property = await tx.property.create({
      data: {
        ownerId: userId,
        title,
        description,
        price,
        priceUnit,
        listingType,
        category,
        city,
        area,
        address,
        latitude,
        longitude,
        // 2. Create Details
        details: {
          create: details,
        },
        // 3. Create Images
        images: {
          create: (images || []).map((img: any, index: number) => ({
            url: img.url,
            isCover: img.isCover || index === 0,
            publicId: img.publicId,
            order: index,
          })),
        },
        // 4. Create Amenities
        amenities: {
          create: (amenities || []).map((name: string) => ({ name })),
        },
      },
      include: {
        details: true,
        images: true,
        amenities: true,
      },
    });

    return property;
  });

  return result;
};

const getAllProperties = async (query: any) => {
  // Public users should only see ACTIVE properties.
  const statusFilter = PropertyStatus.ACTIVE;

  const result = await new QueryBuilder(prisma.property, query, {
    searchableFields: ['title', 'description', 'address', 'city', 'area'],
    filterableFields: ['listingType', 'category', 'city', 'area', 'status'],
  })
    .search()
    .filter()
    .where({ deletedAt: null, status: statusFilter } as any)
    .sort()
    .paginate()
    .include({
      details: true,
      images: { where: { isCover: true }, take: 1 },
      owner: { select: { id: true, name: true, avatarUrl: true } },
    } as any)
    .execute();

  return result;
};

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      details: true,
      images: { orderBy: { order: 'asc' } },
      amenities: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phoneNumber: true,
          createdAt: true,
        },
      },
      agent: {
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      },
      reviews: {
        include: {
          reviewer: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property || property.deletedAt || property.status !== PropertyStatus.ACTIVE) return null;

  // Increment view count
  await prisma.property.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return property;
};

const updateProperty = async (id: string, userId: string, payload: any) => {
  const { details, images, amenities, ...propertyData } = payload;

  // Check ownership
  const existingProperty = await prisma.property.findUnique({ where: { id } });
  if (!existingProperty || existingProperty.ownerId !== userId) {
    throw new Error('Not authorized to update this property');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update basic data
    const updatedProperty = await tx.property.update({
      where: { id },
      data: propertyData,
    });

    // 2. Update Details if provided
    if (details) {
      await tx.propertyDetail.update({
        where: { propertyId: id },
        data: details,
      });
    }

    // 3. Update Images if provided (replace all for simplicity in MVP)
    if (images) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      await tx.propertyImage.createMany({
        data: images.map((img: any, index: number) => ({
          propertyId: id,
          url: img.url,
          isCover: img.isCover || index === 0,
          publicId: img.publicId,
          order: index,
        })),
      });
    }

    // 4. Update Amenities if provided
    if (amenities) {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      await tx.propertyAmenity.createMany({
        data: amenities.map((name: string) => ({
          propertyId: id,
          name,
        })),
      });
    }

    return tx.property.findUnique({
      where: { id },
      include: { details: true, images: true, amenities: true },
    });
  });

  return result;
};

const deleteProperty = async (id: string, userId: string) => {
  const existingProperty = await prisma.property.findUnique({ where: { id } });
  if (!existingProperty || existingProperty.ownerId !== userId) {
    throw new Error('Not authorized to delete this property');
  }

  return await prisma.property.update({
    where: { id },
    data: { deletedAt: new Date(), status: PropertyStatus.INACTIVE },
  });
};

const getMyProperties = async (userId: string, query: any) => {
  const result = await new QueryBuilder(prisma.property, query, {
    searchableFields: ['title', 'description', 'address', 'city', 'area'],
    filterableFields: ['listingType', 'category', 'city', 'area', 'status'],
  })
    .search()
    .filter()
    .where({ ownerId: userId, deletedAt: null } as any)
    .sort()
    .paginate()
    .include({
      details: true,
      images: { where: { isCover: true }, take: 1 },
    } as any)
    .execute();

  return result;
};

const updateStatus = async (id: string, status: PropertyStatus) => {
  return await prisma.property.update({
    where: { id },
    data: { status },
  });
};

export const PropertyServices = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updateStatus,
};
