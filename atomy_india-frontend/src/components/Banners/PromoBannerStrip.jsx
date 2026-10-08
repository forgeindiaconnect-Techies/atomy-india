import React from 'react';
import { ChevronRight } from 'lucide-react';
import './PromoBannerStrip.css';

export default function PromoBannerStrip({ image, text, link = "#", onClick }) {
  const isUserGuide = (text || '').toLowerCase().includes('guide');

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <section className="promo-banner-strip-section">
      <div className="container promo-banner-container">
        <a href={link} className="promo-banner-box" onClick={handleClick}>
          <img src={image} alt={text} className="promo-banner-img" loading="lazy" />
          <div className="promo-banner-overlay-content">
            <span className={`promo-banner-text-link ${isUserGuide ? 'has-underline' : ''}`}>
              <span className="promo-banner-text-word">{text}</span>
              <ChevronRight size={19} className="promo-banner-chevron" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
