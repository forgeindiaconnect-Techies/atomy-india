import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './PromoBannerStrip.css';

export default function PromoBannerStrip({ image, text, link = "#", onClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      if (bannerRef.current) observer.unobserve(bannerRef.current);
    };
  }, []);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <section className="promo-banner-strip-section" ref={bannerRef}>
      <div className="container promo-banner-container">
        <a 
          href={link} 
          className={`promo-banner-box ${isVisible ? 'banner-in-view' : ''}`} 
          onClick={handleClick}
        >
          <img src={image} alt={text} className="promo-banner-img" loading="lazy" />
          <div className="promo-banner-overlay-content">
            <span className="promo-banner-text-link">
              <span className="promo-banner-text-word">{text}</span>
              <ChevronRight size={19} className="promo-banner-chevron" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

