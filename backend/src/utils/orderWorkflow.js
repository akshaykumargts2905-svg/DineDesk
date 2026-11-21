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
  CONFIRMED: 'CONFIRMED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
};

// Map of allowed next statuses from current status
export const ALLOWED_TRANSITIONS = {
  CONFIRMED:  ['ACCEPTED',  'PREPARING', 'READY'],
  ACCEPTED:   ['PREPARING', 'READY'],
  PREPARING:  ['READY'],
  READY:      [],
};

/** Role → which statuses that role may SET */
export const ROLE_ALLOWED_STATUSES = {
  FRONT_OF_HOUSE: ['CONFIRMED', 'READY'],
  KITCHEN_STAFF:  ['ACCEPTED', 'PREPARING', 'READY'],
  MANAGER:        ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY'],
  RESTAURANT_ADMIN: ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY'],
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
