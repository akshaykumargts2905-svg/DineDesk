import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const createRestaurant = async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;

    if (!name) {
      return errorResponse(res, 400, 'Restaurant name is required');
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
      },
    });

    return successResponse(res, 201, 'Restaurant created successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

export const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        _count: {
          select: {
            categories: true,
            menuItems: true,
            tables: true,
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Restaurant details retrieved successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

export const updateMyRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, address, phone } = req.body;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(name && { name: name.trim() }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      },
    });

    return successResponse(res, 200, 'Restaurant updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMyRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    // Use transaction to clean up all related records safely
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({
        where: { user: { restaurantId } },
      });

      // Delete order status history and order items
      await tx.orderStatusHistory.deleteMany({
        where: { order: { restaurantId } },
      });
      await tx.orderItem.deleteMany({
        where: { order: { restaurantId } },
      });

      // Delete orders
      await tx.order.deleteMany({
        where: { restaurantId },
      });

      // Delete tables
      await tx.diningTable.deleteMany({
        where: { restaurantId },
      });

      // Delete menu items and categories
      await tx.menuItem.deleteMany({
        where: { restaurantId },
      });
      await tx.menuCategory.deleteMany({
        where: { restaurantId },
      });

      // Delete users
      await tx.user.deleteMany({
        where: { restaurantId },
      });

      // Delete restaurant
      await tx.restaurant.delete({
        where: { id: restaurantId },
      });
    });

    return successResponse(res, 200, 'Restaurant and all associated records deleted successfully');
  } catch (error) {
    next(error);
  }
};
