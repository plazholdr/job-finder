export function flattenRecord(obj, prefix = '', out = {}) {
  if (obj == null) return out;
  if (Array.isArray(obj)) {
    out[prefix || 'value'] = JSON.stringify(obj);
    return out;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flattenRecord(v, p, out);
      else out[p] = Array.isArray(v) ? JSON.stringify(v) : v;
    }
    return out;
  }
  out[prefix || 'value'] = obj;
  return out;
}

export function recordToCSV(record) {
  const flat = flattenRecord(record);
  const rows = Object.entries(flat).map(([k, v]) => [k, String(v ?? '')]);
  const esc = (s) => '"' + s.replace(/"/g, '""') + '"';
  const lines = [['Field', 'Value'], ...rows].map(r => r.map(esc).join(','));
  return lines.join('\n');
}

export function historyToCSV(history = []) {
  const esc = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const header = ['at','actorUserId','actorRole','action','notes'];
  const lines = [header.map(esc).join(',')];
  for (const h of history) {
    lines.push([
      h.at ? new Date(h.at).toISOString() : '',
      h.actorUserId || '',
      h.actorRole || '',
      h.action || '',
      h.notes || ''
    ].map(esc).join(','));
  }
  return lines.join('\n');
}

