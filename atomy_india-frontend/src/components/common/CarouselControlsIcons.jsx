import React from 'react';

/**
 * Exact carousel control icons matching official Atomy carousel design:
 * - CarouselPauseIcon: Two crisp vertical rounded bars
 * - CarouselPlayIcon: Crisp solid play triangle
 * - CarouselLayersIcon: Overlapping double-cards icon
 */

export function CarouselPauseIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <rect x="2.2" y="1.5" width="2.4" height="9" rx="0.6" fill="#ffffff" />
      <rect x="7.4" y="1.5" width="2.4" height="9" rx="0.6" fill="#ffffff" />
    </svg>
  );
}

export function CarouselPlayIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path d="M3.2 2L9.8 6L3.2 10V2Z" fill="#ffffff" />
    </svg>
  );
}

export function CarouselLayersIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Back overlapping card (top and right) */}
      <path
        d="M4.6 1.8H11.4C12.1 1.8 12.6 2.3 12.6 3.0V9.8"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front primary solid card */}
      <rect
        x="1.4"
        y="4.2"
        width="8.4"
        height="8.4"
        rx="1.4"
        fill="#ffffff"
      />
    </svg>
  );
}
