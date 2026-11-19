import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './PromoBannerStrip.css';

export default function PromoBannerStrip({ image, text, link = "#", onClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const bannerRef = useRef(null);

  const isUserGuide = typeof text === 'string' && text.toLowerCase().includes('guide');
  const isResourceMaterial = typeof text === 'string' && text.toLowerCase().includes('resource');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimKey(k => k + 1);
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

  const handleMouseEnter = () => {
    // Replay road development and guide travel animation on hover
    setAnimKey(k => k + 1);
  };

  return (
    <section className="promo-banner-strip-section" ref={bannerRef}>
      <div className="container promo-banner-container">
        <a 
          href={link} 
          className={`promo-banner-box ${isVisible ? 'banner-in-view' : ''} ${isUserGuide ? 'is-user-guide-strip' : ''} ${isResourceMaterial ? 'is-resource-strip' : ''}`} 
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
        >
          <img src={image} alt={text} className="promo-banner-img" loading="lazy" />

          {/* Special Winding Road and Traveling Guide Pin leading to the 3D Book */}
          {isUserGuide && (
            <div className="promo-guide-road-canvas" key={animKey}>
              <svg
                viewBox="0 0 1000 120"
                preserveAspectRatio="none"
                className="promo-guide-svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Road reveal clip path developing from text edge to book */}
                  <clipPath id={`roadRevealClip-${animKey}`}>
                    <rect x="142" y="0" width="635" height="120" className="road-reveal-rect" />
                  </clipPath>

                  {/* Clean highway gradient */}
                  <linearGradient id="roadHighwayBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e5bb5" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="90%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>

                  {/* Drop shadow for 3D red pin */}
                  <filter id="pinShadow" x="-40%" y="-30%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodOpacity="0.35" floodColor="#000000" />
                  </filter>
                </defs>

                {/* 1. Seamless Winding Road: 100% visible, robust layers matching Image 2 */}
                <g clipPath={`url(#roadRevealClip-${animKey})`}>
                  {/* Soft Ground Shadow underneath road */}
                  <path
                    d="M 142,60 C 235,82 330,42 430,62 C 530,82 630,44 725,62 C 745,66 760,70 772,76"
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.12)"
                    strokeWidth="19"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(0, 3)"
                  />
                  {/* Outer White Curbs */}
                  <path
                    d="M 142,60 C 235,82 330,42 430,62 C 530,82 630,44 725,62 C 745,66 760,70 772,76"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Highway Blue Surface */}
                  <path
                    d="M 142,60 C 235,82 330,42 430,62 C 530,82 630,44 725,62 C 745,66 760,70 772,76"
                    fill="none"
                    stroke="url(#roadHighwayBlue)"
                    strokeWidth="11.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Center Dashed Divider Line */}
                  <path
                    d="M 142,60 C 235,82 330,42 430,62 C 530,82 630,44 725,62 C 745,66 760,70 772,76"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                    className="road-dashed-divider"
                  />
                </g>

                {/* 2. Destination Arrival Landing at Book Page (Stops cleanly before the book, merging with the page) */}
                <g className="destination-book-pin" transform="translate(772, 76)" filter="url(#pinShadow)">
                  <ellipse cx="0" cy="3" rx="6" ry="2.2" fill="rgba(0,0,0,0.22)" />
                  <circle cx="0" cy="0" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="0" cy="0" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" className="destination-pulse-ring" />
                </g>

                {/* 3. Traveling Red Guide Location Pin Marker (arrives directly at the open page entrance) */}
                <g className="traveling-guide-pin" filter="url(#pinShadow)">
                  <ellipse cx="0" cy="3" rx="7" ry="2.6" fill="rgba(0,0,0,0.28)" />
                  <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.6"
                    transform="scale(0.85) translate(-12, -22)"
                  />
                  <circle cx="0" cy="-7" r="3.5" fill="#ffffff" />
                  <animateMotion
                    path="M 142,60 C 235,82 330,42 430,62 C 530,82 630,44 725,62 C 745,66 760,70 772,76"
                    dur="2.4s"
                    begin="0.75s"
                    fill="freeze"
                    keyTimes="0;1"
                    keyPoints="0;1"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1"
                  />
                </g>
              </svg>
            </div>
          )}

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

