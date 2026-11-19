import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const createCategory = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, 400, 'Category name is required');
    }

    // Check unique category name within the restaurant
    const existing = await prisma.menuCategory.findUnique({
      where: {
        restaurantId_name: {
          restaurantId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return errorResponse(res, 400, `A category named '${name.trim()}' already exists in your restaurant`);
    }

    const category = await prisma.menuCategory.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        restaurantId,
      },
    });

    return successResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { search, includeItems } = req.query;

    const where = {
      restaurantId,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const categories = await prisma.menuCategory.findMany({
      where,
      include: {
        _count: {
          select: { menuItems: true },
        },
        ...(includeItems === 'true' && {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' },
          },
        }),
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const category = await prisma.menuCategory.findFirst({
      where: { id, restaurantId },
      include: {
        menuItems: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }

    return successResponse(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { name, description } = req.body;

    const existingCategory = await prisma.menuCategory.findFirst({
      where: { id, restaurantId },
    });

    if (!existingCategory) {
      return errorResponse(res, 404, 'Category not found');
    }

    if (name && name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicate = await prisma.menuCategory.findUnique({
        where: {
          restaurantId_name: {
            restaurantId,
            name: name.trim(),
          },
        },
      });

      if (duplicate) {
        return errorResponse(res, 400, `A category named '${name.trim()}' already exists`);
      }
    }

    const updated = await prisma.menuCategory.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
      },
    });

    return successResponse(res, 200, 'Category updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const existingCategory = await prisma.menuCategory.findFirst({
      where: { id, restaurantId },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!existingCategory) {
      return errorResponse(res, 404, 'Category not found');
    }

    // Business rule: Prevent deletion of categories that have menu items
    if (existingCategory._count.menuItems > 0) {
      return errorResponse(
        res,
        400,
        `Cannot delete category '${existingCategory.name}' because it contains ${existingCategory._count.menuItems} menu item(s). Please reassign or delete the items first.`
      );
    }

    await prisma.menuCategory.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
