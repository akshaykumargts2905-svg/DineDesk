import prisma from '../config/db.js';

/**
 * Service to manage notifications across restaurant staff
 */
export const notifyOrderReady = async (restaurantId, order) => {
  try {
    // Find active staff who should be notified (FRONT_OF_HOUSE, MANAGER, RESTAURANT_ADMIN)
    const staffMembers = await prisma.user.findMany({
      where: {
        restaurantId,
        isActive: true,
        role: {
          in: ['FRONT_OF_HOUSE', 'MANAGER'],
        },
      },
      select: { id: true },
    });

    if (!staffMembers.length) {
      return;
    }

    const tableInfo = order.table ? `Table #${order.table.tableNumber}` : (order.orderType || 'Order');
    const title = `Order #${order.orderNumber} Ready`;
    const message = `Order #${order.orderNumber} (${tableInfo}) is ready for serving!`;

    const notificationsData = staffMembers.map((staff) => ({
      userId: staff.id,
      orderId: order.id,
      title,
      message,
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });
  } catch (error) {
    console.error('Error creating order ready notifications:', error);
  }
};

/**
 * General helper to create a notification for a user
 */
export const createNotification = async ({ userId, orderId = null, title, message }) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        orderId,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
