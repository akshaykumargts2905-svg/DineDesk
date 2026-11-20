import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { isValidStatusTransition } from '../utils/orderWorkflow.js';

export const getActiveOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { orderType, tableId } = req.query;

    const activeStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'];

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: activeStatuses },
        ...(orderType && { orderType }),
        ...(tableId && { tableId }),
      },
      include: {
        table: true,
        items: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 200, 'Active orders for tracking retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const trackOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const order = await prisma.order.findFirst({
      where: {
        restaurantId,
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        table: true,
        items: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            changedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Order tracking details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const markOrderServed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { note } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        restaurantId,
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!isValidStatusTransition(order.status, 'SERVED')) {
      return errorResponse(
        res,
        400,
        `Cannot mark order as served from status '${order.status}'. It must be 'READY' first.`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'SERVED' },
        include: { items: true, table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'SERVED',
          note: note ? note.trim() : 'Order served to customer',
          changedById: req.user.id,
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 10000 });

    return successResponse(res, 200, 'Order marked as served', updated);
  } catch (error) {
    next(error);
  }
};

export const completeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { note, paymentStatus = 'PAID', paymentMethod } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        restaurantId,
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!isValidStatusTransition(order.status, 'COMPLETED')) {
      return errorResponse(
        res,
        400,
        `Cannot complete order from status '${order.status}'. Order must be 'SERVED' first.`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          ...(paymentStatus && { paymentStatus }),
          ...(paymentMethod && { paymentMethod }),
        },
        include: { items: true, table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'COMPLETED',
          note: note ? note.trim() : 'Order completed and finalized',
          changedById: req.user.id,
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 10000 });

    return successResponse(res, 200, 'Order completed successfully', updated);
  } catch (error) {
    next(error);
  }
};
