import React, { useState } from 'react';
import './FloatingToolbar.css';

// Exact menu toggle icon matching user's Image (3 horizontal bars with top-right chevron arrow)
export function MenuToggleIcon({ isOpen = false, size = 24 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.85)}
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Top Bar left section */}
      <line
        x1="2.5"
        y1="3.5"
        x2="10"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      {/* Chevron arrow on top right */}
      {isOpen ? (
        <path
          d="M13.5 5.5L16.5 2.5L19.5 5.5"
          stroke="#00A3E0"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M13.5 2.5L16.5 5.5L19.5 2.5"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Middle full bar */}
      <line
        x1="2.5"
        y1="9.5"
        x2="19.5"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      {/* Bottom full bar */}
      <line
        x1="2.5"
        y1="15.5"
        x2="19.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FloatingToolbar() {
  const [hoveredItem, setHoveredItem] = useState(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <aside
      className="floatingBx clean-divider-style fixed-corner-arrows"
      aria-label="Scroll Navigation"
    >
      <h3 className="ir">Scroll Navigation</h3>

      {/* 1. Top Scroll Button */}
      <div className="floating-item-row top-row">
        <button
          type="button"
          onClick={scrollToTop}
          className="floating-btn"
          aria-label="Scroll to Top"
          onMouseEnter={() => setHoveredItem('top')}
          onMouseLeave={() => setHoveredItem(null)}
          onTouchStart={() => setHoveredItem('top')}
          onTouchEnd={() => setHoveredItem(null)}
        >
          <svg className="arrow-icon" width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 9L7 4.5L11.5 9"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`tooltip-label ${hoveredItem === 'top' ? 'visible' : ''}`}>
            Top
          </span>
        </button>
      </div>

      {/* 2. Bottom Scroll Button */}
      <div className="floating-item-row bottom-row">
        <button
          type="button"
          onClick={scrollToBottom}
          className="floating-btn"
          aria-label="Scroll to Bottom"
          onMouseEnter={() => setHoveredItem('bottom')}
          onMouseLeave={() => setHoveredItem(null)}
          onTouchStart={() => setHoveredItem('bottom')}
          onTouchEnd={() => setHoveredItem(null)}
        >
          <svg className="arrow-icon" width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 5L7 9.5L11.5 5"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`tooltip-label ${hoveredItem === 'bottom' ? 'visible' : ''}`}>
            Bottom
          </span>
        </button>
      </div>
    </aside>
  );
}
