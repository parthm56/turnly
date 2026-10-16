/**
 * Pure helpers for the dynamic customer intake form. No Firebase import, so the
 * shape logic stays unit-testable: `node scripts/fields.test.mjs`
 *
 * Field shape: [{ id, label, type: 'choice'|'text', mode: 'single'|'multi',
 *                 required, options: [{ id, name, price }] }]
 */

export const nextId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Firebase turns arrays into {0:{},1:{}} on write, so flatten back to arrays on read
export function normaliseFields(fields) {
  if (!fields) return [];
  return Object.values(fields).map(f => ({
    ...f,
    options: f?.options ? Object.values(f.options) : [],
  }));
}

export function normaliseDetails(details) {
  if (!details) return [];
  return Object.values(details).map(d => ({
    ...d,
    items: d?.items ? Object.values(d.items) : undefined,
  }));
}

/**
 * Snapshot the customer's picks against the business's own field config, so the staff
 * dashboard and ticket render labels/prices without re-reading the config.
 * selections = { [fieldId]: string | { [optionId]: qty } }
 */
export function buildDetails(fields, selections, sanitize = (v) => v) {
  const details = [];
  for (const f of normaliseFields(fields)) {
    const sel = selections?.[f.id];
    if (f.type === 'text') {
      const value = sanitize(typeof sel === 'string' ? sel : '');
      if (f.required && !value) return { error: `Please answer "${f.label}".` };
      if (value) details.push({ label: f.label, type: 'text', value });
    } else if (f.mode === 'single') {
      const opt = f.options.find(o => o.id === sel);
      if (f.required && !opt) return { error: `Please choose "${f.label}".` };
      if (opt) details.push({ label: f.label, type: 'choice', value: opt.name, price: Number(opt.price) || 0 });
    } else {
      const items = f.options
        .map(o => ({ name: o.name, price: Number(o.price) || 0, qty: Math.max(0, parseInt(sel?.[o.id], 10) || 0) }))
        .filter(i => i.qty > 0);
      if (f.required && !items.length) return { error: `Please select at least one option for "${f.label}".` };
      if (items.length) {
        details.push({ label: f.label, type: 'choice', items, total: items.reduce((sum, i) => sum + i.price * i.qty, 0) });
      }
    }
  }
  return { details };
}
