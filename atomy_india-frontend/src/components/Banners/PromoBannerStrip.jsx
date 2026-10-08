import React from 'react';
import './PromoBannerStrip.css';

export default function PromoBannerStrip({ image, text, link = "#" }) {
  return (
    <section className="promo-banner-strip-section">
      <div className="container">
        <a href={link} className="promo-banner-box">
          <img src={image} alt={text} className="promo-banner-img" loading="lazy" />
          <span className="promo-banner-label">
            <em>{text}</em>
          </span>
        </a>
      </div>
    </section>
  );
}
