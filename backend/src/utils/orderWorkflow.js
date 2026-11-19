/**
 * Order Status Transition Rules & Validation
 */

export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Map of allowed next statuses from current status
export const ALLOWED_TRANSITIONS = {
  PLACED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Checks if transitioning from currentStatus to newStatus is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;
  if (currentStatus === newStatus) return true; // idempotent

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};
