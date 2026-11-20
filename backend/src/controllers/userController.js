import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const ALLOWED_ROLES = ['RESTAURANT_ADMIN', 'MANAGER', 'FRONT_OF_HOUSE', 'KITCHEN_STAFF'];

export const createStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return errorResponse(res, 400, 'Name, email, password, and role are required');
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return errorResponse(res, 400, `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`);
    }

    // Only RESTAURANT_ADMIN (Restaurant Owner) can create staff accounts
    if (req.user.role !== 'RESTAURANT_ADMIN') {
      return errorResponse(res, 403, 'Forbidden: Only Restaurant Admin (Owner) can create staff accounts');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email address format');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return errorResponse(res, 400, 'A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        restaurantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(res, 201, 'Staff account created successfully', user);
  } catch (error) {
    next(error);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      restaurantId,
      ...(role && { role }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          restaurantId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return successResponse(
      res,
      200,
      'Staff list retrieved successfully',
      users,
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

export const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const user = await prisma.user.findFirst({
      where: {
        id,
        restaurantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdOrders: true,
            statusUpdates: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 404, 'Staff member not found');
    }

    return successResponse(res, 200, 'Staff member retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { name, email, role, password } = req.body;

    const existingStaff = await prisma.user.findFirst({
      where: { id, restaurantId },
    });

    if (!existingStaff) {
      return errorResponse(res, 404, 'Staff member not found');
    }

    // Role hierarchy protection
    if (existingStaff.role === 'RESTAURANT_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
      return errorResponse(res, 403, 'Only Admins can modify Admin accounts');
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return errorResponse(res, 400, `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`);
    }

    if (role === 'RESTAURANT_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
      return errorResponse(res, 403, 'Only Admins can promote users to Admin role');
    }

    // Email uniqueness check
    if (email && email.toLowerCase() !== existingStaff.email.toLowerCase()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailConflict) {
        return errorResponse(res, 400, 'Another user with this email already exists');
      }
    }

    const dataToUpdate = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(role && { role }),
    };

    if (password) {
      if (password.length < 6) {
        return errorResponse(res, 400, 'Password must be at least 6 characters long');
      }
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        updatedAt: true,
      },
    });

    return successResponse(res, 200, 'Staff member updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const { isActive } = req.body;

    if (id === req.user.id) {
      return errorResponse(res, 400, 'You cannot change your own account active status');
    }

    const existingStaff = await prisma.user.findFirst({
      where: { id, restaurantId },
    });

    if (!existingStaff) {
      return errorResponse(res, 404, 'Staff member not found');
    }

    if (existingStaff.role === 'RESTAURANT_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
      return errorResponse(res, 403, 'Only Admins can change Admin account status');
    }

    const newStatus = typeof isActive === 'boolean' ? isActive : !existingStaff.isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        updatedAt: true,
      },
    });

    return successResponse(
      res,
      200,
      `Staff member ${newStatus ? 'activated' : 'deactivated'} successfully`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    if (id === req.user.id) {
      return errorResponse(res, 400, 'You cannot delete your own account');
    }

    const existingStaff = await prisma.user.findFirst({
      where: { id, restaurantId },
    });

    if (!existingStaff) {
      return errorResponse(res, 404, 'Staff member not found');
    }

    if (existingStaff.role === 'RESTAURANT_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
      return errorResponse(res, 403, 'Only Admins can delete Admin accounts');
    }

    // Delete staff member safely
    await prisma.user.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Staff member deleted successfully');
  } catch (error) {
    next(error);
  }
};
