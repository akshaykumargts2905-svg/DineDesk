import prisma from '../config/db.js';
import { successResponse } from '../utils/responseHandler.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    // Fetch counts by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { restaurantId },
      _count: {
        _all: true,
      },
    });

    const statusMap = {
      PLACED: 0,
      ACCEPTED: 0,
      PREPARING: 0,
      READY: 0,
      SERVED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    let totalOrders = 0;
    statusCounts.forEach((sc) => {
      statusMap[sc.status] = sc._count._all;
      totalOrders += sc._count._all;
    });

    // Calculate total completed revenue
    const salesAggregate = await prisma.order.aggregate({
      where: {
        restaurantId,
        status: { in: ['COMPLETED', 'SERVED'] },
      },
      _sum: {
        total: true,
      },
    });

    const totalSales = salesAggregate._sum.total ? parseFloat(salesAggregate._sum.total) : 0;

    // Today's orders and revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayAggregate = await prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: { gte: todayStart },
        status: { in: ['COMPLETED', 'SERVED'] },
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    });

    const todayOrdersCount = await prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: todayStart },
      },
    });

    const todaySales = todayAggregate._sum.total ? parseFloat(todayAggregate._sum.total) : 0;

    return successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
      totalOrders,
      todayOrders: todayOrdersCount,
      pendingOrders: statusMap.PLACED,
      acceptedOrders: statusMap.ACCEPTED,
      preparingOrders: statusMap.PREPARING,
      readyOrders: statusMap.READY,
      servedOrders: statusMap.SERVED,
      completedOrders: statusMap.COMPLETED,
      cancelledOrders: statusMap.CANCELLED,
      totalSales,
      todaySales,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { limit = 10 } = req.query;

    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const recentOrders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        table: {
          select: { tableNumber: true },
        },
        items: {
          select: {
            itemName: true,
            quantity: true,
            lineTotal: true,
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    return successResponse(res, 200, 'Recent orders retrieved successfully', recentOrders);
  } catch (error) {
    next(error);
  }
};

export const getSalesSummary = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    // Total and completed sales aggregates
    const [allSales, paymentBreakdown, orderTypeBreakdown] = await Promise.all([
      prisma.order.aggregate({
        where: {
          restaurantId,
          status: { not: 'CANCELLED' },
        },
        _sum: {
          subtotal: true,
          tax: true,
          discount: true,
          total: true,
        },
        _avg: {
          total: true,
        },
        _count: {
          _all: true,
        },
      }),

      // Breakdown by payment method
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          restaurantId,
          status: { not: 'CANCELLED' },
          paymentMethod: { not: null },
        },
        _sum: {
          total: true,
        },
        _count: {
          _all: true,
        },
      }),

      // Breakdown by order type
      prisma.order.groupBy({
        by: ['orderType'],
        where: {
          restaurantId,
          status: { not: 'CANCELLED' },
        },
        _sum: {
          total: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const formattedPaymentBreakdown = paymentBreakdown.map((item) => ({
      method: item.paymentMethod,
      orderCount: item._count._all,
      revenue: item._sum.total ? parseFloat(item._sum.total) : 0,
    }));

    const formattedOrderTypeBreakdown = orderTypeBreakdown.map((item) => ({
      type: item.orderType,
      orderCount: item._count._all,
      revenue: item._sum.total ? parseFloat(item._sum.total) : 0,
    }));

    return successResponse(res, 200, 'Sales summary retrieved successfully', {
      totalRevenue: allSales._sum.total ? parseFloat(allSales._sum.total) : 0,
      totalSubtotal: allSales._sum.subtotal ? parseFloat(allSales._sum.subtotal) : 0,
      totalTax: allSales._sum.tax ? parseFloat(allSales._sum.tax) : 0,
      totalDiscount: allSales._sum.discount ? parseFloat(allSales._sum.discount) : 0,
      averageOrderValue: allSales._avg.total ? parseFloat(allSales._avg.total.toFixed(2)) : 0,
      totalOrders: allSales._count._all,
      byPaymentMethod: formattedPaymentBreakdown,
      byOrderType: formattedOrderTypeBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderSummary = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    const [statusSummary, typeSummary, paymentStatusSummary] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { restaurantId },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['orderType'],
        where: { restaurantId },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        where: { restaurantId },
        _count: { _all: true },
      }),
    ]);

    const statusCounts = {};
    statusSummary.forEach((s) => {
      statusCounts[s.status] = s._count._all;
    });

    const typeCounts = {};
    typeSummary.forEach((t) => {
      typeCounts[t.orderType] = t._count._all;
    });

    const paymentCounts = {};
    paymentStatusSummary.forEach((p) => {
      paymentCounts[p.paymentStatus] = p._count._all;
    });

    return successResponse(res, 200, 'Order summary retrieved successfully', {
      byStatus: statusCounts,
      byOrderType: typeCounts,
      byPaymentStatus: paymentCounts,
    });
  } catch (error) {
    next(error);
  }
};
