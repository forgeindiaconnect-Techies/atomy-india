/**
 * Utility functions for Indian mobile numbers (+91)
 */

export function normalizeIndianMobile(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');

  // If starts with 91 and has 12 digits (or starts with 91 followed by 6, 7, 8, 9), strip country code 91
  if (digits.length >= 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function isValidIndianMobile(phone) {
  const clean = normalizeIndianMobile(phone);
  return /^[6-9]\d{9}$/.test(clean);
}

export function formatIndianMobileDisplay(phone) {
  const clean = normalizeIndianMobile(phone);
  if (!clean) return '';
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return `+91 ${clean}`;
}

