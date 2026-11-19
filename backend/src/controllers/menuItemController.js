import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const createMenuItem = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description, price, imageUrl, isAvailable = true, prepTimeMinutes, categoryId } = req.body;

    if (!name || price === undefined || !categoryId) {
      return errorResponse(res, 400, 'Name, price, and categoryId are required');
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return errorResponse(res, 400, 'Price must be a valid positive number');
    }

    // Validate that category belongs to this restaurant
    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurantId },
    });

    if (!category) {
      return errorResponse(res, 400, 'Category not found or does not belong to your restaurant');
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isAvailable: Boolean(isAvailable),
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : null,
        restaurantId,
        categoryId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(res, 201, 'Menu item created successfully', menuItem);
  } catch (error) {
    next(error);
  }
};

export const getAllMenuItems = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { categoryId, isAvailable, search, page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      restaurantId,
      ...(categoryId && { categoryId }),
      ...(isAvailable !== undefined && { isAvailable: isAvailable === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.menuItem.count({ where }),
      prisma.menuItem.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
        skip,
        take: limitNum,
      }),
    ]);

    return successResponse(
      res,
      200,
      'Menu items retrieved successfully',
      items,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const item = await prisma.menuItem.findFirst({
      where: { id, restaurantId },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!item) {
      return errorResponse(res, 404, 'Menu item not found');
    }

    return successResponse(res, 200, 'Menu item retrieved successfully', item);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { name, description, price, imageUrl, isAvailable, prepTimeMinutes, categoryId } = req.body;

    const existing = await prisma.menuItem.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Menu item not found');
    }

    if (categoryId && categoryId !== existing.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: categoryId, restaurantId },
      });
      if (!category) {
        return errorResponse(res, 400, 'Invalid category: Category does not exist in your restaurant');
      }
    }

    let parsedPrice;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return errorResponse(res, 400, 'Price must be a valid positive number');
      }
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? imageUrl.trim() : null }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(prepTimeMinutes !== undefined && {
          prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : null,
        }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(res, 200, 'Menu item updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItemAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { isAvailable } = req.body;

    const existing = await prisma.menuItem.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Menu item not found');
    }

    const newStatus = typeof isAvailable === 'boolean' ? isAvailable : !existing.isAvailable;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: newStatus },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(
      res,
      200,
      `Menu item marked as ${newStatus ? 'available' : 'unavailable'}`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const existing = await prisma.menuItem.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Menu item not found');
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Menu item deleted successfully');
  } catch (error) {
    next(error);
  }
};
