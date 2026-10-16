/**
 * Self-check for the dynamic intake form logic. No test runner in this repo, so:
 *   node scripts/fields.test.mjs
 */
import assert from 'node:assert/strict';
import { buildDetails, normaliseFields, normaliseDetails } from '../lib/fields.mjs';

const fields = [
  { id: 'f_menu', label: 'Select items', type: 'choice', mode: 'multi', required: true,
    options: [
      { id: 'o1', name: 'Biryani', price: 250 },
      { id: 'o2', name: 'Naan', price: 40 },
    ] },
  { id: 'f_worker', label: 'Choose stylist', type: 'choice', mode: 'single', required: true,
    options: [{ id: 'o3', name: 'Ravi' }, { id: 'o4', name: 'Asha' }] },
  { id: 'f_notes', label: 'Notes', type: 'text', required: false },
];

// Menu order: quantity math, totals, unknown option ids ignored
assert.deepEqual(
  buildDetails(fields, { f_menu: { o1: 2, o2: 3, oX: 5 }, f_worker: 'o4', f_notes: 'no onions' }).details,
  [
    { label: 'Select items', type: 'choice',
      items: [
        { name: 'Biryani', price: 250, qty: 2 },
        { name: 'Naan', price: 40, qty: 3 },
      ], total: 620 },
    { label: 'Choose stylist', type: 'choice', value: 'Asha', price: 0 },
    { label: 'Notes', type: 'text', value: 'no onions' },
  ],
);

// Required checks: menu with nothing picked, then missing single choice
assert.match(buildDetails(fields, { f_worker: 'o3' }).error, /Select items/);
assert.match(buildDetails(fields, { f_menu: { o1: 1 } }).error, /Choose stylist/);
// Zero and bogus quantities do not count as a selection
assert.ok(buildDetails(fields, { f_menu: { o1: 0 }, f_worker: 'o3' }).error);
assert.ok(buildDetails(fields, { f_menu: { o1: 'abc' }, f_worker: 'o3' }).error);
// Numeric strings from <input> still add up
assert.equal(buildDetails(fields, { f_menu: { o1: '2' }, f_worker: 'o3' }).details[0].total, 500);
// Nothing configured: no details, no error (businesses without a custom form)
assert.deepEqual(buildDetails(null, {}), { details: [] });
assert.deepEqual(buildDetails([], {}), { details: [] });
// Sanitizer is applied to text answers
assert.equal(
  buildDetails(fields, { f_menu: { o1: 1 }, f_worker: 'o3', f_notes: '  hi  ' }, (v) => v.trim()).details.at(-1).value,
  'hi',
);

// Firebase stores arrays as {0:{},1:{}} — reads must flatten back
assert.deepEqual(
  normaliseFields({ 0: { id: 'a', label: 'A', options: { 0: { id: 'o', name: 'N' } } } }),
  [{ id: 'a', label: 'A', options: [{ id: 'o', name: 'N' }] }],
);
assert.deepEqual(
  normaliseDetails({ 0: { label: 'L', items: { 0: { name: 'X', qty: 1 } } } }),
  [{ label: 'L', items: [{ name: 'X', qty: 1 }] }],
);

console.log('fields.test.mjs — all checks passed');
