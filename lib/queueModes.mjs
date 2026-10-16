/**
 * TURNLY — Queue Modes
 * One mode is active per business at a time, switched from Account Settings.
 *
 *   standard — customers join, staff call them up one by one.   (walk-ins)
 *   order    — customers place an order and pay at the counter, staff confirm it,
 *              then the kitchen prepares it.                    (food counters)
 *
 * Pure data + helpers only (no Firebase import) so this can be unit-tested in Node.
 */

export const QUEUE_MODE_STANDARD = 'standard';
export const QUEUE_MODE_ORDER = 'order';

/** The selectable modes, in display order. `tagline` is the short flow summary. */
export const QUEUE_MODES = [
  {
    id: QUEUE_MODE_STANDARD,
    name: 'Standard Queue',
    tagline: 'Call → Serve → Done',
    description:
      'Customers take a token and staff call them up one by one. Best for salons, clinics and walk-in counters.',
  },
  {
    id: QUEUE_MODE_ORDER,
    name: 'Order Queue',
    tagline: 'Confirm → Prepare → Done',
    description:
      'Customers place an order and pay at the counter. Staff confirm it, then the kitchen prepares it. Best for food and beverage counters.',
  },
];

/** Missing, legacy or unrecognised values all fall back to the standard queue. */
export function normaliseQueueMode(mode) {
  return mode === QUEUE_MODE_ORDER ? QUEUE_MODE_ORDER : QUEUE_MODE_STANDARD;
}

export function modeName(mode) {
  const m = QUEUE_MODES.find(x => x.id === normaliseQueueMode(mode));
  return m ? m.name : 'Standard Queue';
}

// ─── Status groups, as each mode displays them ─────────────────────

/** Standard mode: the customer has been called and is being served. */
export const STANDARD_ACTIVE = ['CALLED', 'SERVING'];

/** Order mode — New Queue: placed, awaiting payment + staff confirmation. */
export const ORDER_NEW = ['WAITING'];

/** Order mode — Confirm Order queue: confirmed, waiting to be / being prepared. */
export const ORDER_CONFIRM = ['CONFIRMED', 'PREPARING'];

/** Terminal statuses, shown under "Completed Today" in both modes. */
export const FINISHED = ['COMPLETED', 'NO_SHOW', 'CANCELLED'];

export function isFinished(status) {
  return FINISHED.includes(status);
}
