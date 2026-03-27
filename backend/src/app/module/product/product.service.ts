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
  const statusFilter = query.status || 'ACTIVE';

  return await new QueryBuilder(prisma.product, query, {
    searchableFields: ['title', 'description'],
    filterableFields: ['storeId', 'categoryId', 'status'],
  })
    .search()
    .filter()
    .where({ deletedAt: null, status: statusFilter } as any)
    .sort()
    .paginate()
    .include({
      store: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
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
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
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
