import { errorResponse } from '../utils/responseHandler.js';

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'fields';
    return errorResponse(res, 400, `A record with this ${fields} already exists`);
  }

  // Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    return errorResponse(res, 400, 'Invalid reference: Related record does not exist');
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'The requested record was not found');
  }

  // Fallback server error
  return errorResponse(
    res,
    err.status || 500,
    err.message || 'An unexpected internal server error occurred'
  );
};
