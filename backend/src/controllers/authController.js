import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dinedesk_jwt_secret_key_2026_super_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
    secret,
    { expiresIn }
  );
};

export const register = async (req, res, next) => {
  try {
    const { restaurantName, address, phone, name, email, password } = req.body;

    if (!restaurantName || !name || !email || !password) {
      return errorResponse(res, 400, 'Restaurant name, user name, email, and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Please provide a valid email address');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse(res, 400, 'A user with this email address already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Restaurant and Admin User atomically using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName.trim(),
          address: address ? address.trim() : null,
          phone: phone ? phone.trim() : null,
        },
      });

      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'RESTAURANT_ADMIN',
          restaurantId: restaurant.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          restaurantId: true,
          createdAt: true,
        },
      });

      return { restaurant, user };
    }, { timeout: 15000, maxWait: 10000 });

    const token = generateToken(result.user);

    return successResponse(res, 201, 'Restaurant and admin user registered successfully', {
      token,
      user: result.user,
      restaurant: result.restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Contact your administrator');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user);

    // Exclude password from response
    const { password: _, ...userData } = user;

    return successResponse(res, 200, 'Login successful', {
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile retrieved successfully', req.user);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
