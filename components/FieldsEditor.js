'use client';
import { useState } from 'react';
import { saveBusinessFields } from '@/lib/queueStore';

const rid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const TYPES = [
  { value: 'multi',  label: 'Menu — choose many + quantity' },
  { value: 'single', label: 'Choose one (e.g. staff / stylist)' },
  { value: 'text',   label: 'Text answer' },
];

const inputStyle = { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)', fontSize: 13, width: '100%' };

/** Structured editor for the dynamic customer intake form (menu, staff list, questions). */
export default function FieldsEditor({ business }) {
  const [fields, setFields] = useState(business?.fields || []);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const patch = (i, p) => setFields(fs => fs.map((f, idx) => idx === i ? { ...f, ...p } : f));
  const addField = () => setFields(fs => [...fs, { id: rid('f'), label: '', type: 'choice', mode: 'multi', required: false, options: [] }]);
  const addOption = (i) => setFields(fs => fs.map((f, idx) => idx === i ? { ...f, options: [...f.options, { id: rid('o'), name: '', price: '' }] } : f));

  const save = async () => {
    setMsg(''); setErr(''); setSaving(true);
    try {
      const res = await saveBusinessFields(business.slug, fields);
      if (res?.error) setErr(res.error);
      else { setMsg('Customer form saved. Customers will see it immediately.'); setFields(res.fields); }
    } catch {
      setErr('Failed to save the customer form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {msg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, color: '#166534', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>{err}</div>}

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', color: '#18181b' }}>What customers pick when they join</h3>
        <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.5 }}>
          Build a menu, a staff list, or ask a question. Leave it empty and customers just enter their name as usual.
        </p>
      </div>

      {fields.map((f, i) => (
        <div key={f.id} style={{ background: '#fafaf9', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input style={inputStyle} placeholder="Field label — e.g. Select your items" value={f.label}
              onChange={e => patch(i, { label: e.target.value })} />
            <button type="button" title="Remove field" onClick={() => setFields(fs => fs.filter((_, idx) => idx !== i))}
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={{ ...inputStyle, width: 'auto', minWidth: 230 }} value={f.type === 'text' ? 'text' : f.mode}
              onChange={e => {
                const v = e.target.value;
                patch(i, v === 'text' ? { type: 'text' } : { type: 'choice', mode: v });
              }}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#444' }}>
              <input type="checkbox" checked={Boolean(f.required)} onChange={e => patch(i, { required: e.target.checked })} />
              Required
            </label>
          </div>

          {f.type !== 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: '2px solid #e7f5ed' }}>
              {f.options.map((o, oi) => (
                <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input style={{ ...inputStyle, flex: 1 }}
                    placeholder={f.mode === 'single' ? 'e.g. Ravi (staff name)' : 'e.g. Chicken Biryani'}
                    value={o.name}
                    onChange={e => patch(i, { options: f.options.map((x, xi) => xi === oi ? { ...x, name: e.target.value } : x) })} />
                  <input style={{ ...inputStyle, width: 100 }} type="number" min="0" placeholder="Cost" value={o.price}
                    onChange={e => patch(i, { options: f.options.map((x, xi) => xi === oi ? { ...x, price: e.target.value } : x) })} />
                  <button type="button" onClick={() => patch(i, { options: f.options.filter((_, xi) => xi !== oi) })}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(i)}
                style={{ alignSelf: 'flex-start', background: '#fff', border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#166534' }}>
                + Add option
              </button>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn-secondary" onClick={addField} style={{ padding: '10px 16px', fontSize: 13 }}>+ Add a field</button>
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Customer Form'}</button>
      </div>
    </div>
  );
}
