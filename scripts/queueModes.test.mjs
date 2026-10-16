/**
 * Self-check for the queue-mode logic. No test runner in this repo, so:
 *   node scripts/queueModes.test.mjs
 */
import assert from 'node:assert/strict';
import {
  QUEUE_MODE_STANDARD,
  QUEUE_MODE_ORDER,
  QUEUE_MODES,
  normaliseQueueMode,
  modeName,
  STANDARD_ACTIVE,
  ORDER_NEW,
  ORDER_CONFIRM,
  FINISHED,
  isFinished,
  isOrderConfirmed,
} from '../lib/queueModes.mjs';

// Exactly two modes, in display order
assert.equal(QUEUE_MODES.length, 2);
assert.deepEqual(QUEUE_MODES.map(m => m.id), [QUEUE_MODE_STANDARD, QUEUE_MODE_ORDER]);
assert.ok(QUEUE_MODES.every(m => m.name && m.tagline && m.description));

// Only the exact "order" string selects the order queue; everything else is standard
assert.equal(normaliseQueueMode('order'), QUEUE_MODE_ORDER);
assert.equal(normaliseQueueMode('standard'), QUEUE_MODE_STANDARD);
for (const junk of [undefined, null, '', 'ORDER', 'Order', 'order ', 'queue', 0, 1, true, {}, []]) {
  assert.equal(normaliseQueueMode(junk), QUEUE_MODE_STANDARD, `expected standard for ${JSON.stringify(junk)}`);
}

// Friendly label used on the dashboard and in the settings toast
assert.equal(modeName('order'), 'Order Queue');
assert.equal(modeName('standard'), 'Standard Queue');
assert.equal(modeName(undefined), 'Standard Queue');

// Status groups do not overlap, so a token is never shown in two lists at once
const groups = { STANDARD_ACTIVE, ORDER_NEW, ORDER_CONFIRM, FINISHED };
const seen = new Map();
for (const [groupName, statuses] of Object.entries(groups)) {
  assert.ok(Array.isArray(statuses) && statuses.length > 0, `${groupName} must be a non-empty array`);
  for (const s of statuses) {
    assert.equal(seen.get(s), undefined, `${s} appears in both ${seen.get(s)} and ${groupName}`);
    seen.set(s, groupName);
  }
}

// Order mode: placed → confirmed → preparing → finished
assert.deepEqual(ORDER_NEW, ['WAITING']);
assert.deepEqual(ORDER_CONFIRM, ['CONFIRMED', 'PREPARING']);
assert.ok(!ORDER_NEW.includes('CONFIRMED'));
assert.ok(!ORDER_CONFIRM.includes('COMPLETED'));

assert.ok(isFinished('COMPLETED') && isFinished('NO_SHOW') && isFinished('CANCELLED'));
for (const live of ['WAITING', 'CALLED', 'SERVING', 'CONFIRMED', 'PREPARING']) {
  assert.equal(isFinished(live), false, `${live} must not count as finished`);
}

// "I've Paid" gate: a freshly placed order must NOT pass through to the waiting
// screen until staff have acted on it.
for (const notYet of ['WAITING', undefined, null, '']) {
  assert.equal(isOrderConfirmed(notYet), false, `${String(notYet)} must be blocked`);
}
for (const past of ['CONFIRMED', 'PREPARING', 'COMPLETED', 'NO_SHOW', 'CANCELLED']) {
  assert.equal(isOrderConfirmed(past), true, `${past} should be allowed through`);
}

console.log('queueModes.test.mjs — all checks passed');
