import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { isValidStatusTransition } from '../utils/orderWorkflow.js';
import { notifyOrderReady } from '../services/notificationService.js';

const ALLOWED_ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
const ALLOWED_PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED'];
const ALLOWED_PAYMENT_METHODS = ['CASH', 'CARD', 'UPI', 'OTHER'];

// Helper to generate unique order number per restaurant
const generateOrderNumber = async (tx, restaurantId) => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  let isUnique = false;
  let orderNumber = '';

  while (!isUnique) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    const existing = await tx.order.findUnique({
      where: {
        restaurantId_orderNumber: {
          restaurantId,
          orderNumber,
        },
      },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return orderNumber;
};

export const createOrder = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const {
      customerName,
      customerPhone,
      orderType,
      tableId,
      items,
      notes,
      taxPercent = 5,
      discount = 0,
      paymentStatus = 'UNPAID',
      paymentMethod,
    } = req.body;

    // Validate orderType
    if (!orderType || !ALLOWED_ORDER_TYPES.includes(orderType)) {
      return errorResponse(
        res,
        400,
        `Invalid orderType. Allowed types: ${ALLOWED_ORDER_TYPES.join(', ')}`
      );
    }

    // Validate table for DINE_IN
    let table = null;
    if (orderType === 'DINE_IN') {
      if (!tableId) {
        return errorResponse(res, 400, 'tableId is required for DINE_IN orders');
      }

      table = await prisma.diningTable.findFirst({
        where: { id: tableId, restaurantId },
      });

      if (!table) {
        return errorResponse(res, 400, 'Selected table was not found in your restaurant');
      }

      if (!table.isActive) {
        return errorResponse(res, 400, `Table #${table.tableNumber} is currently inactive`);
      }
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'Order must contain at least one item');
    }

    // Fetch and validate menu items from DB
    const menuItemIds = items.map((i) => i.menuItemId).filter(Boolean);
    if (menuItemIds.length !== items.length) {
      return errorResponse(res, 400, 'Each item in the order must have a valid menuItemId');
    }

    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
      },
    });

    const dbItemsMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    // Check item existence, availability and quantity
    const orderItemsToCreate = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const dbItem = dbItemsMap.get(item.menuItemId);

      if (!dbItem) {
        return errorResponse(res, 400, `Menu item ${item.menuItemId} not found in this restaurant`);
      }

      if (!dbItem.isAvailable) {
        return errorResponse(res, 400, `'${dbItem.name}' is currently unavailable`);
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return errorResponse(res, 400, `Quantity for '${dbItem.name}' must be at least 1`);
      }

      const unitPrice = parseFloat(dbItem.price);
      const lineTotal = parseFloat((unitPrice * qty).toFixed(2));
      calculatedSubtotal += lineTotal;

      orderItemsToCreate.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        unitPrice,
        quantity: qty,
        lineTotal,
        specialInstructions: item.specialInstructions ? item.specialInstructions.trim() : null,
      });
    }

    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    // Calculate tax and discount safely on backend
    const taxRate = Math.max(0, parseFloat(taxPercent) || 0);
    const calculatedTax = parseFloat(((calculatedSubtotal * taxRate) / 100).toFixed(2));

    const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
    if (parsedDiscount > calculatedSubtotal + calculatedTax) {
      return errorResponse(res, 400, 'Discount cannot exceed order total');
    }

    const calculatedTotal = parseFloat((calculatedSubtotal + calculatedTax - parsedDiscount).toFixed(2));

    // Execute Order creation atomically with nested items and initial statusHistory
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName ? customerName.trim() : null,
        customerPhone: customerPhone ? customerPhone.trim() : null,
        orderType,
        status: 'CONFIRMED',
        paymentStatus: ALLOWED_PAYMENT_STATUSES.includes(paymentStatus) ? paymentStatus : 'UNPAID',
        paymentMethod: ALLOWED_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : null,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        discount: parsedDiscount,
        total: calculatedTotal,
        notes: notes ? notes.trim() : null,
        restaurantId,
        tableId: orderType === 'DINE_IN' ? tableId : null,
        createdById: req.user.id,
        items: {
          create: orderItemsToCreate,
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'CONFIRMED',
            note: 'Order placed',
            changedById: req.user.id,
          },
        },
      },
      include: {
        items: true,
        table: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return successResponse(res, 201, 'Order created successfully', newOrder);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const {
      status,
      orderType,
      paymentStatus,
      tableId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      restaurantId,
      ...(status && { status }),
      ...(orderType && { orderType }),
      ...(paymentStatus && { paymentStatus }),
      ...(tableId && { tableId }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          table: true,
          createdBy: {
            select: { id: true, name: true, role: true },
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
      'Orders retrieved successfully',
      orders,
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

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        items: true,
        table: true,
        createdBy: {
          select: { id: true, name: true, role: true, email: true },
        },
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

    return successResponse(res, 200, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { customerName, customerPhone, notes, paymentStatus, paymentMethod, tableId } = req.body;

    const existingOrder = await prisma.order.findFirst({
      where: { id, restaurantId },
    });

    if (!existingOrder) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (existingOrder.status === 'READY') {
      return errorResponse(
        res,
        400,
        `Cannot edit order details because order is already ${existingOrder.status}`
      );
    }

    if (tableId && tableId !== existingOrder.tableId) {
      const table = await prisma.diningTable.findFirst({
        where: { id: tableId, restaurantId },
      });
      if (!table) {
        return errorResponse(res, 400, 'Table not found in your restaurant');
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName: customerName ? customerName.trim() : null }),
        ...(customerPhone !== undefined && { customerPhone: customerPhone ? customerPhone.trim() : null }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
        ...(paymentStatus && ALLOWED_PAYMENT_STATUSES.includes(paymentStatus) && { paymentStatus }),
        ...(paymentMethod && ALLOWED_PAYMENT_METHODS.includes(paymentMethod) && { paymentMethod }),
        ...(tableId !== undefined && { tableId }),
      },
      include: {
        items: true,
        table: true,
      },
    });

    return successResponse(res, 200, 'Order updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { status, note } = req.body;

    if (!status) {
      return errorResponse(res, 400, 'Target status is required');
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        table: true,
      },
    });

    if (!existingOrder) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Role-based restrictions on status updates
    const { ROLE_ALLOWED_STATUSES } = await import('../utils/orderWorkflow.js');
    const roleAllowed = ROLE_ALLOWED_STATUSES[req.user.role];
    if (roleAllowed && !roleAllowed.includes(status)) {
      return errorResponse(
        res,
        403,
        `Your role (${req.user.role}) is not permitted to set status to '${status}'`
      );
    }

    // Validate status transition
    if (!isValidStatusTransition(existingOrder.status, status)) {
      return errorResponse(
        res,
        400,
        `Invalid status transition from '${existingOrder.status}' to '${status}'`
      );
    }

    // Idempotent check
    if (existingOrder.status === status) {
      return successResponse(res, 200, `Order is already in status ${status}`, existingOrder);
    }

    // Execute in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
          table: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: existingOrder.status,
          toStatus: status,
          note: note ? note.trim() : `Status changed to ${status}`,
          changedById: req.user.id,
        },
      });

      return order;
    }, { timeout: 15000, maxWait: 10000 });

    // When status changes to READY, trigger notifications for Front of House staff
    if (status === 'READY') {
      await notifyOrderReady(restaurantId, updatedOrder);
    }

    return successResponse(
      res,
      200,
      `Order status updated to '${status}' successfully`,
      updatedOrder
    );
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { cancellationReason } = req.body;

    const existingOrder = await prisma.order.findFirst({
      where: { id, restaurantId },
    });

    if (!existingOrder) {
      return errorResponse(res, 404, 'Order not found');
    }

    const cancelledOrder = await prisma.order.delete({
      where: { id },
      include: {
        items: true,
        table: true,
      },
    });

    return successResponse(res, 200, 'Order cancelled successfully', cancelledOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrderStatusHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
      select: { id: true, orderNumber: true, status: true },
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: id },
      orderBy: { changedAt: 'asc' },
      include: {
        changedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return successResponse(res, 200, 'Order status history retrieved successfully', {
      order,
      history,
    });
  } catch (error) {
    next(error);
  }
};
