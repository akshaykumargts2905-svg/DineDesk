import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { errorResponse } from '../utils/responseHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication token required');
    }

    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, 'JWT_SECRET is not configured');
    }
    const secret = process.env.JWT_SECRET;
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }

    // Fetch user from DB to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'User account is deactivated');
    }

    const isDemo = decoded.isDemo === true;
    const isWriteRequest = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const isLogout = req.originalUrl.split('?')[0].endsWith('/api/auth/logout');

    if (isDemo && isWriteRequest && !isLogout) {
      return errorResponse(res, 403, 'Demo mode is read-only. Changes are disabled.');
    }

    req.user = { ...user, isDemo };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 500, 'Authentication error');
  }
};
