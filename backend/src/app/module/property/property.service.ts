import { ListingType, PropertyStatus } from '../../../../generated/prisma/client/index.js';
import prisma from '../../lib/prisma.js';

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
          create: images.map((img: any, index: number) => ({
            url: img.url,
            isCover: img.isCover || index === 0,
            order: index,
          })),
        },
        // 4. Create Amenities
        amenities: {
          create: amenities.map((name: string) => ({ name })),
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
  const {
    listingType,
    category,
    minPrice,
    maxPrice,
    city,
    area,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    searchTerm,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    status: query.status || PropertyStatus.ACTIVE,
    deletedAt: null,
  };

  if (listingType) where.listingType = listingType;
  if (category) where.category = category;
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (area) where.area = { contains: area, mode: 'insensitive' };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  // Nested filtering for details
  const detailsWhere: any = {};
  if (bedrooms) detailsWhere.bedrooms = Number(bedrooms);
  if (bathrooms) detailsWhere.bathrooms = Number(bathrooms);
  if (minArea || maxArea) {
    detailsWhere.areaSqft = {};
    if (minArea) detailsWhere.areaSqft.gte = Number(minArea);
    if (maxArea) detailsWhere.areaSqft.lte = Number(maxArea);
  }

  if (Object.keys(detailsWhere).length > 0) {
    where.details = detailsWhere;
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { address: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        details: true,
        images: { where: { isCover: true } },
        owner: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: properties,
  };
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

  if (!property || property.deletedAt) return null;

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

const getMyProperties = async (userId: string) => {
  return await prisma.property.findMany({
    where: {
      ownerId: userId,
      deletedAt: null,
    },
    include: {
      details: true,
      images: { where: { isCover: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
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
