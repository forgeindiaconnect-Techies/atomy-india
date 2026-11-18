// Indian Standard Time (IST) Date & Time Formatting Utilities

export function parseDateSafe(input) {
  if (!input) return new Date();
  if (input instanceof Date) return isNaN(input.getTime()) ? new Date() : input;
  let str = String(input).trim();
  if (!str) return new Date();
  
  // If the timestamp has no timezone offset (e.g. "2026-11-12T17:25:35.604" or "2026-11-12 17:25:35"),
  // it was already recorded directly in India local wall-clock time by Spring Boot.
  // Parse year, month, day, hour, minute, second explicitly to preserve the exact daytime:
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const y = parseInt(match[1], 10);
    const mo = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const h = parseInt(match[4], 10);
    const m = parseInt(match[5], 10);
    const s = parseInt(match[6] || '0', 10);
    return new Date(y, mo, d, h, m, s);
  }
  
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatTimeIST(input) {
  if (!input) return '';
  const d = parseDateSafe(input);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateIST(input) {
  if (!input) return '';
  const d = parseDateSafe(input);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTimeIST(input) {
  if (!input) return '';
  return `${formatDateIST(input)} at ${formatTimeIST(input)}`;
}

