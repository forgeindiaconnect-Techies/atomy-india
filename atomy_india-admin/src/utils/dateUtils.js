// Indian Standard Time (IST) Date & Time Formatting Utilities

export function parseDateSafe(input) {
  if (!input) return new Date();
  if (input instanceof Date) return isNaN(input.getTime()) ? new Date() : input;
  let str = String(input).trim();
  
  // If it's an ISO timestamp from server without timezone offset (e.g. "2026-11-05T08:40:00"),
  // Render server runs in UTC, so treat it as UTC by appending 'Z'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(str)) {
    str += 'Z';
  }
  
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatTimeIST(input) {
  const d = parseDateSafe(input);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

export function formatDateIST(input) {
  const d = parseDateSafe(input);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

export function formatDateTimeIST(input) {
  return `${formatDateIST(input)} at ${formatTimeIST(input)}`;
}

