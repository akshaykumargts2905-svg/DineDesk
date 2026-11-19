import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const createTable = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableNumber, seats, isActive = true } = req.body;

    if (tableNumber === undefined || tableNumber === null) {
      return errorResponse(res, 400, 'Table number is required');
    }

    const parsedTableNum = parseInt(tableNumber, 10);
    if (isNaN(parsedTableNum) || parsedTableNum <= 0) {
      return errorResponse(res, 400, 'Table number must be a positive integer');
    }

    // Check unique table number within the restaurant
    const existing = await prisma.diningTable.findUnique({
      where: {
        restaurantId_tableNumber: {
          restaurantId,
          tableNumber: parsedTableNum,
        },
      },
    });

    if (existing) {
      return errorResponse(
        res,
        400,
        `Table #${parsedTableNum} already exists in your restaurant`
      );
    }

    const table = await prisma.diningTable.create({
      data: {
        tableNumber: parsedTableNum,
        seats: seats ? parseInt(seats, 10) : null,
        isActive: Boolean(isActive),
        restaurantId,
      },
    });

    return successResponse(res, 201, 'Table created successfully', table);
  } catch (error) {
    next(error);
  }
};

export const getAllTables = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { isActive, includeCurrentOrder } = req.query;

    const where = {
      restaurantId,
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
    };

    const tables = await prisma.diningTable.findMany({
      where,
      include: {
        ...(includeCurrentOrder === 'true' && {
          orders: {
            where: {
              status: {
                in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'],
              },
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              customerName: true,
              total: true,
              createdAt: true,
            },
          },
        }),
      },
      orderBy: { tableNumber: 'asc' },
    });

    // Format tables to indicate occupied state
    const formattedTables = tables.map((tbl) => ({
      ...tbl,
      isOccupied: tbl.orders && tbl.orders.length > 0,
      currentOrder: tbl.orders && tbl.orders.length > 0 ? tbl.orders[0] : null,
    }));

    return successResponse(res, 200, 'Dining tables retrieved successfully', formattedTables);
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const table = await prisma.diningTable.findFirst({
      where: { id, restaurantId },
      include: {
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            customerName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!table) {
      return errorResponse(res, 404, 'Table not found');
    }

    return successResponse(res, 200, 'Table details retrieved successfully', table);
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { tableNumber, seats, isActive } = req.body;

    const existing = await prisma.diningTable.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Table not found');
    }

    let parsedTableNum;
    if (tableNumber !== undefined) {
      parsedTableNum = parseInt(tableNumber, 10);
      if (isNaN(parsedTableNum) || parsedTableNum <= 0) {
        return errorResponse(res, 400, 'Table number must be a positive integer');
      }

      if (parsedTableNum !== existing.tableNumber) {
        const conflict = await prisma.diningTable.findUnique({
          where: {
            restaurantId_tableNumber: {
              restaurantId,
              tableNumber: parsedTableNum,
            },
          },
        });
        if (conflict) {
          return errorResponse(res, 400, `Table #${parsedTableNum} already exists`);
        }
      }
    }

    const updated = await prisma.diningTable.update({
      where: { id },
      data: {
        ...(parsedTableNum !== undefined && { tableNumber: parsedTableNum }),
        ...(seats !== undefined && { seats: seats ? parseInt(seats, 10) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return successResponse(res, 200, 'Table updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { isActive } = req.body;

    const existing = await prisma.diningTable.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Table not found');
    }

    const newStatus = typeof isActive === 'boolean' ? isActive : !existing.isActive;

    const updated = await prisma.diningTable.update({
      where: { id },
      data: { isActive: newStatus },
    });

    return successResponse(
      res,
      200,
      `Table #${existing.tableNumber} ${newStatus ? 'activated' : 'deactivated'} successfully`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const existing = await prisma.diningTable.findFirst({
      where: { id, restaurantId },
      include: {
        orders: {
          where: {
            status: {
              in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'],
            },
          },
        },
      },
    });

    if (!existing) {
      return errorResponse(res, 404, 'Table not found');
    }

    // Business rule: Prevent deletion if active orders exist on this table
    if (existing.orders.length > 0) {
      return errorResponse(
        res,
        400,
        `Cannot delete Table #${existing.tableNumber} because it currently has active order(s). Complete or cancel them first.`
      );
    }

    await prisma.diningTable.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Table deleted successfully');
  } catch (error) {
    next(error);
  }
};
