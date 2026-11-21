/**
 * Order Status Transition Rules & Validation
 *
 * 4-Step Kitchen Workflow:
 *  1. CONFIRMED   – Order created and confirmed
 *  2. ACCEPTED    – Kitchen accepts
 *  3. PREPARING   – Kitchen starts cooking
 *  4. READY       – Kitchen marks ready / completed
 */

export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Map of allowed next statuses from current status
export const ALLOWED_TRANSITIONS = {
  PLACED:     ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'],
  CONFIRMED:  ['ACCEPTED',  'PREPARING', 'READY', 'CANCELLED'],
  ACCEPTED:   ['PREPARING', 'READY', 'CANCELLED'],
  PREPARING:  ['READY',     'CANCELLED'],
  READY:      ['SERVED',    'COMPLETED'],
  SERVED:     ['COMPLETED'],
  COMPLETED:  [],
  CANCELLED:  [],
};

/** Role → which statuses that role may SET */
export const ROLE_ALLOWED_STATUSES = {
  FRONT_OF_HOUSE: ['CONFIRMED', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
  KITCHEN_STAFF:  ['ACCEPTED', 'PREPARING', 'READY'],
  MANAGER:        ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
  RESTAURANT_ADMIN: ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
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
