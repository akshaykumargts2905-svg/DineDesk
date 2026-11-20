/**
 * Order Status Transition Rules & Validation
 *
 * 6-Step Workflow:
 *  1. PLACED      – Customer / Waiter creates order
 *  2. CONFIRMED   – Waiter clicks "Confirm & Send to Kitchen"
 *  3. ACCEPTED    – Kitchen clicks "Accept"
 *  4. PREPARING   – Kitchen clicks "Start Cooking"
 *  5. READY       – Kitchen clicks "Mark Ready"  → Waiter notified
 *  6. COMPLETED   – Waiter clicks "Mark Served"
 */

export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Map of allowed next statuses from current status
export const ALLOWED_TRANSITIONS = {
  PLACED:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['ACCEPTED',  'CANCELLED'],
  ACCEPTED:   ['PREPARING', 'CANCELLED'],
  PREPARING:  ['READY',     'CANCELLED'],
  READY:      ['COMPLETED'],
  COMPLETED:  [],
  CANCELLED:  [],
};

/** Role → which statuses that role may SET */
export const ROLE_ALLOWED_STATUSES = {
  FRONT_OF_HOUSE: ['CONFIRMED', 'COMPLETED'],
  KITCHEN_STAFF:  ['ACCEPTED', 'PREPARING', 'READY'],
  MANAGER:        ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
  RESTAURANT_ADMIN: ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
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
