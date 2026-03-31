import prisma from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/QueryBuilder.js';

const createProduct = async (userId: string, payload: any) => {
  // Verify store ownership
  const store = await prisma.store.findUnique({
    where: { ownerId: userId }
  });

  if (!store) {
    throw new Error('User does not have a store. Create a store first.');
  }

  const result = await prisma.product.create({
    data: {
      ...payload,
      storeId: store.id,
      price: Number(payload.price),
      stock: Number(payload.stock),
    },
  });
  return result;
};

const getAllProducts = async (query: any) => {
  // Public users should only see ACTIVE products.
  // Store owners can see their own products (handled via storeId filter if needed, 
  // but for the general marketplace, we strictly enforce ACTIVE)
  const statusFilter = 'ACTIVE';

  return await new QueryBuilder(prisma.product, query, {
    searchableFields: ['title', 'description'],
    filterableFields: ['storeId', 'categoryId', 'status'],
  })
    .search()
    .filter()
    .where({ 
      deletedAt: null, 
      ...(statusFilter ? { status: statusFilter } : {}) 
    } as any)
    .sort()
    .paginate()
    .include({
      store: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
      flags: { take: 1, orderBy: { createdAt: 'desc' } },
    } as any)
    .execute();
};

const getProductById = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      store: {
        include: {
          owner: {
            select: {
                id: true,
                name: true,
                avatarUrl: true
            }
          }
        }
      },
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!result || result.status !== "ACTIVE" || result.deletedAt) {
    return null;
  }

  return result;
};

const updateProduct = async (userId: string, id: string, payload: any) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true }
  });

  if (!product || product.store.ownerId !== userId) {
    throw new Error('Not authorized to update this product');
  }

  const result = await prisma.product.update({
    where: { id },
    data: {
        ...payload,
        price: payload.price ? Number(payload.price) : undefined,
        stock: payload.stock ? Number(payload.stock) : undefined
    },
  });
  return result;
};

const deleteProduct = async (userId: string, id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true }
  });

  if (!product || product.store.ownerId !== userId) {
    throw new Error('Not authorized to delete this product');
  }

  const result = await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'INACTIVE' },
  });
  return result;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
