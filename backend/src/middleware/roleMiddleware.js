import { errorResponse } from '../utils/responseHandler.js';

/**
 * Middleware to restrict access based on user roles
 * @param  {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: Please log in first');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};
