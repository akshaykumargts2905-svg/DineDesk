import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { isRead, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return successResponse(
      res,
      200,
      'Notifications retrieved successfully',
      {
        notifications,
        unreadCount,
      },
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

export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
          },
        },
      },
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return successResponse(res, 200, 'Notification retrieved successfully', notification);
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, 200, 'Notification marked as read', updated);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return successResponse(
      res,
      200,
      `${result.count} notification(s) marked as read`,
      { updatedCount: result.count }
    );
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Notification not found');
    }

    await prisma.notification.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};
