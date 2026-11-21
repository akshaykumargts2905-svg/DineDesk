import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { isValidStatusTransition } from '../utils/orderWorkflow.js';
import { notifyOrderReady } from '../services/notificationService.js';

export const getKitchenOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { status } = req.query;

    // Kitchen sees: CONFIRMED (needs accept), ACCEPTED, PREPARING, READY
    const kitchenStatuses = status ? [status] : ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY'];

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: kitchenStatuses },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                prepTimeMinutes: true,
                imageUrl: true,
              },
            },
          },
        },
        table: {
          select: {
            tableNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Kitchen orders processed in FIFO
    });

    return successResponse(res, 200, 'Kitchen orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const getKitchenOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                prepTimeMinutes: true,
                imageUrl: true,
              },
            },
          },
        },
        table: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Kitchen order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const acceptKitchenOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { note } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!isValidStatusTransition(order.status, 'ACCEPTED')) {
      return errorResponse(
        res,
        400,
        `Cannot accept order: expected status CONFIRMED but got '${order.status}'`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: { items: true, table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'ACCEPTED',
          note: note ? note.trim() : 'Kitchen accepted order',
          changedById: req.user.id,
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 10000 });

    return successResponse(res, 200, 'Order accepted by kitchen', updated);
  } catch (error) {
    next(error);
  }
};

export const startKitchenPreparation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { note } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!isValidStatusTransition(order.status, 'PREPARING')) {
      return errorResponse(
        res,
        400,
        `Cannot start preparation for order currently in '${order.status}' status`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'PREPARING' },
        include: { items: true, table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'PREPARING',
          note: note ? note.trim() : 'Kitchen started preparation',
          changedById: req.user.id,
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 10000 });

    return successResponse(res, 200, 'Order preparation started', updated);
  } catch (error) {
    next(error);
  }
};

export const markKitchenOrderReady = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { note } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
      include: { table: true },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!isValidStatusTransition(order.status, 'READY')) {
      return errorResponse(
        res,
        400,
        `Cannot mark order ready from '${order.status}' status`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'READY' },
        include: { items: true, table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'READY',
          note: note ? note.trim() : 'Food is ready for service',
          changedById: req.user.id,
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 10000 });

    // Auto-create notification for front of house staff
    await notifyOrderReady(restaurantId, updated);

    return successResponse(res, 200, 'Order marked as ready for service', updated);
  } catch (error) {
    next(error);
  }
};
