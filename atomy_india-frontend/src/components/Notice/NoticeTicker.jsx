import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { NOTICE_ITEMS } from '../../data/mockData';
import './NoticeTicker.css';

export default function NoticeTicker() {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % NOTICE_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const noticeText = NOTICE_ITEMS[currentNoticeIndex];

  return (
    <div className="notice-ticker-section">
      <div className="container notice-container">
        <a
          href="#notice-board"
          className="notice-link"
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('atomy:open-notice'));
          }}
        >
          <span className="notice-title">{noticeText}</span>
          <span className="notice-arrow-btn">
            <ChevronRight size={18} />
          </span>
        </a>
      </div>
    </div>
  );
}
