import prisma from '../../lib/prisma.js';
import { PropertyStatus, ProductStatus } from '../../../../generated/prisma/client/index.js';

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    totalProducts,
    flaggedProducts,
    totalOrders,
    totalRevenue,
    activeAgents,
    flaggedPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING, deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: ProductStatus.FLAGGED, deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    }),
    prisma.agentProfile.count({ where: { isVerified: true } }),
    prisma.post.count({ where: { status: 'FLAGGED', deletedAt: null } }),
  ]);

  return {
    users: { total: totalUsers },
    properties: { total: totalProperties, pending: pendingProperties },
    products: { total: totalProducts, flagged: flaggedProducts },
    posts: { flagged: flaggedPosts },
    orders: { total: totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0 },
    agents: { total: activeAgents }
  };
};

export const AdminServices = {
  getDashboardStats,
};
