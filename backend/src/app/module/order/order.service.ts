import prisma from '../../lib/prisma.js';

const createOrder = async (userId: string, payload: { storeId: string; items: { productId: string; quantity: number }[]; shippingAddress: any }) => {
  const { storeId, items, shippingAddress } = payload;

  // 1. Calculate total and validate stock
  let totalAmount = 0;
  const orderItemsData: any[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;

    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal
    });
  }

  // 2. Create order in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create order
    const order = await tx.order.create({
      data: {
        buyerId: userId,
        storeId,
        totalAmount,
        shippingAddress,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    // Update stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return order;
  });

  return result;
};

const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true }
      },
      store: true,
      buyer: {
        select: { name: true, email: true, avatarUrl: true }
      },
      payment: true
    }
  });

  if (!order) return null;

  // Authorization check
  if (role !== 'ADMIN' && order.buyerId !== userId && order.store.ownerId !== userId) {
    throw new Error('Not authorized to view this order');
  }

  return order;
};

const getMyOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { buyerId: userId },
    include: {
      items: { include: { product: true } },
      store: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getStoreOrders = async (userId: string) => {
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) throw new Error('Store not found');

  return await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateOrderStatus = async (userId: string, orderId: string, status: any) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true }
  });

  if (!order) throw new Error('Order not found');

  // Authorization: Seller of the store or Admin
  const isOwner = order.store.ownerId === userId;
  // Note: Admin check would usually be in middleware, but we double check here
  if (!isOwner) {
     const user = await prisma.user.findUnique({ where: { id: userId } });
     if (user?.role !== 'ADMIN') throw new Error('Not authorized to update status');
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
};

export const OrderServices = {
  createOrder,
  getOrderById,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus,
};
