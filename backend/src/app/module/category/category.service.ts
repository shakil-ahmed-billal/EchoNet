import prisma from '../../lib/prisma.js';

const createCategory = async (userId: string, payload: any) => {
  const result = await prisma.category.create({
    data: {
      ...payload,
      createdBy: userId,
    },
  });
  return result;
};

const getAllCategories = async () => {
    // Return hierarchical categories
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            children: true
        }
    });
    return categories;
};

const getCategoryById = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      products: {
        where: { status: 'ACTIVE' },
        take: 10
      }
    },
  });
  return result;
};

const updateCategory = async (id: string, payload: any) => {
  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCategory = async (id: string) => {
  // Check if it has products
  const productCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productCount > 0) {
    throw new Error('Cannot delete category with active products. Re-assign them first.');
  }

  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
