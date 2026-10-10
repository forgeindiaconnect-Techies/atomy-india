import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  HERO_SLIDES,
  ALL_CATALOG_PRODUCTS,
  BEST_PRODUCTS,
  ABSOLUTE_SKINCARE_PRODUCTS
} from '../../data/mockData';
import { getHeroSlides } from '../../services/bannerService';
import { CarouselPauseIcon, CarouselPlayIcon, CarouselLayersIcon } from '../common/CarouselControlsIcons';
import './HeroSlider.css';

// Helper to look up product associated with any slide banner
export const findProductForSlide = (slide) => {
  if (!slide) return null;
  const pool = [
    ...(Array.isArray(ALL_CATALOG_PRODUCTS) ? ALL_CATALOG_PRODUCTS : []),
    ...(Array.isArray(BEST_PRODUCTS) ? BEST_PRODUCTS : []),
    ...(Array.isArray(ABSOLUTE_SKINCARE_PRODUCTS) ? ABSOLUTE_SKINCARE_PRODUCTS : [])
  ];

  // 1. Direct match by productId
  if (slide.productId) {
    const found = pool.find(p => p && String(p.id).trim().toUpperCase() === String(slide.productId).trim().toUpperCase());
    if (found) return found;
  }

  const str = `${slide.title || ''} ${slide.subtitle || ''} ${slide.desc || ''}`.toLowerCase();

  // 2. Absolute Skincare Set (Slide 6 in screenshot)
  if (str.includes('absolute')) {
    return pool.find(p => p && p.id === 'D00207') || pool.find(p => p && p.name && p.name.toLowerCase().includes('absolute'));
  }

  // 3. HemoHIM (Slides 4 & 5)
  if (str.includes('hemohim')) {
    return pool.find(p => p && p.id === 'D00101') || pool.find(p => p && p.name && p.name.toLowerCase().includes('hemohim'));
  }

  // 4. Evening Care (Slide 7)
  if (str.includes('evening care')) {
    return pool.find(p => p && p.id === 'D00351') || pool.find(p => p && p.name && p.name.toLowerCase().includes('evening care'));
  }

  // 5. Shilajit (Slide 8)
  if (str.includes('shilajit')) {
    return pool.find(p => p && p.id === 'D94085') || pool.find(p => p && p.name && p.name.toLowerCase().includes('shilajit'));
  }

  // 6. Spirulina (Slide 9)
  if (str.includes('spirulina')) {
    return pool.find(p => p && p.id === 'D90178') || pool.find(p => p && p.name && p.name.toLowerCase().includes('spirulina'));
  }

  return null;
};

export default function HeroSlider({
  onProductClick,
  onNavigateMembership,
  onNavigateView,
  onSelectCategory
}) {
  const [slides, setSlides] = useState(() => getHeroSlides());

  useEffect(() => {
    const handleUpdate = () => setSlides(getHeroSlides());
    window.addEventListener('atomy:hero-slides-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('atomy:hero-slides-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeSlides = slides && slides.length > 0 ? slides : HERO_SLIDES;
  const extendedSlides = [activeSlides[activeSlides.length - 1], ...activeSlides, activeSlides[0]];
  const [slideTrackIdx, setSlideTrackIdx] = useState(1);
  const [isSlideTransitionEnabled, setIsSlideTransitionEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Real 0-based slide index for indicator icons, counters, and modal selection
  const currentSlide = slideTrackIdx === 0
    ? activeSlides.length - 1
    : (slideTrackIdx === activeSlides.length + 1 ? 0 : slideTrackIdx - 1);

  // Auto-play timer (slides clockwise continuously)
  useEffect(() => {
    if (!isPlaying || isViewAllOpen) return;
    const interval = setInterval(() => {
      setIsSlideTransitionEnabled(true);
      setSlideTrackIdx((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, isViewAllOpen]);

  // Seamless clockwise snap on transition end
  const handleSlideTransitionEnd = () => {
    if (slideTrackIdx >= HERO_SLIDES.length + 1) {
      setIsSlideTransitionEnabled(false);
      setSlideTrackIdx(1);
      setTimeout(() => {
        setIsSlideTransitionEnabled(true);
      }, 50);
    } else if (slideTrackIdx <= 0) {
      setIsSlideTransitionEnabled(false);
      setSlideTrackIdx(HERO_SLIDES.length);
      setTimeout(() => {
        setIsSlideTransitionEnabled(true);
      }, 50);
    }
  };

  // Robust scroll lock and anti-shake logic
  useEffect(() => {
    if (isViewAllOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isViewAllOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isViewAllOpen) {
        setIsViewAllOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewAllOpen]);

  useEffect(() => {
    const handleOpen = () => setIsViewAllOpen(true);
    window.addEventListener('atomy:open-ads-modal', handleOpen);
    return () => window.removeEventListener('atomy:open-ads-modal', handleOpen);
  }, []);

  const handlePrev = () => {
    setIsSlideTransitionEnabled(true);
    setSlideTrackIdx((prev) => prev - 1);
  };

  const handleNext = () => {
    setIsSlideTransitionEnabled(true);
    setSlideTrackIdx((prev) => prev + 1);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectSlide = (index) => {
    setIsSlideTransitionEnabled(true);
    setSlideTrackIdx(index + 1);
    setIsViewAllOpen(false);
  };

  // Handle clicking on a slide to navigate to product details or respective destination
  const handleSlideClick = (slide, e) => {
    if (e && (e.target.closest('button') || e.target.closest('.slider-controls-badge') || e.target.closest('.slider-arrow'))) {
      return;
    }

    const matchedProd = findProductForSlide(slide);
    if (matchedProd && onProductClick) {
      onProductClick(matchedProd);
      return;
    }

    const titleLower = (slide.title || '').toLowerCase();
    const subLower = (slide.subtitle || '').toLowerCase();

    if (slide.viewTarget === 'membership' || titleLower.includes('member') || subLower.includes('member')) {
      if (onNavigateMembership) onNavigateMembership();
      return;
    }
    if (slide.viewTarget === 'seminars' || titleLower.includes('seminar') || titleLower.includes('talk show')) {
      if (onNavigateView) onNavigateView('seminars');
      return;
    }
    if (slide.viewTarget === 'about' || titleLower.includes('paralympic') || titleLower.includes('partner')) {
      if (onNavigateView) onNavigateView('about');
      return;
    }
    if (slide.link) {
      if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank', 'noopener,noreferrer');
      } else if (onNavigateView) {
        onNavigateView(slide.link);
      }
    }
  };

  const handleViewAllItemClick = (slide, idx) => {
    const matchedProd = findProductForSlide(slide);
    if (matchedProd && onProductClick) {
      setIsViewAllOpen(false);
      onProductClick(matchedProd);
      return;
    }

    const titleLower = (slide.title || '').toLowerCase();
    const subLower = (slide.subtitle || '').toLowerCase();

    if (slide.viewTarget === 'membership' || titleLower.includes('member') || subLower.includes('member')) {
      setIsViewAllOpen(false);
      if (onNavigateMembership) onNavigateMembership();
      return;
    }
    if (slide.viewTarget === 'seminars' || titleLower.includes('seminar') || titleLower.includes('talk show')) {
      setIsViewAllOpen(false);
      if (onNavigateView) onNavigateView('seminars');
      return;
    }
    if (slide.viewTarget === 'about' || titleLower.includes('paralympic') || titleLower.includes('partner')) {
      setIsViewAllOpen(false);
      if (onNavigateView) onNavigateView('about');
      return;
    }
    if (slide.link) {
      setIsViewAllOpen(false);
      if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank', 'noopener,noreferrer');
      } else if (onNavigateView) {
        onNavigateView(slide.link);
      }
      return;
    }

    handleSelectSlide(idx);
  };

  return (
    <div className="hero-slider-section">
      <div
        className="hero-slider-track"
        style={{
          transform: `translateX(-${slideTrackIdx * 100}%)`,
          transition: isSlideTransitionEnabled
            ? 'transform 0.65s cubic-bezier(0.25, 1, 0.4, 1)'
            : 'none'
        }}
        onTransitionEnd={handleSlideTransitionEnd}
      >
        {extendedSlides.map((slide, index) => {
          const itemRealIdx = index === 0
            ? activeSlides.length - 1
            : (index === activeSlides.length + 1 ? 0 : index - 1);
          const isActive = itemRealIdx === currentSlide;
          const matchedProd = findProductForSlide(slide);
          const tooltipText = matchedProd
            ? `Click to view ${matchedProd.name} details`
            : (slide.title || 'Explore');

          return (
            <div
              key={`${slide.id}-${index}`}
              className={`hero-slide ${isActive ? 'active' : ''} ${matchedProd ? 'has-product-link' : ''}`}
              style={{ backgroundColor: slide.bg }}
              onClick={(e) => handleSlideClick(slide, e)}
              role="button"
              tabIndex={isActive ? 0 : -1}
              aria-label={tooltipText}
              title={tooltipText}
            >
              {/* Full-bleed background image covering 100% of the container */}
              <div
                className="hero-slide-bg"
                style={{ backgroundImage: `url(${slide.img})` }}
              />

              {/* Clean Text Overlay (No Box, authentic typography) */}
              {slide.hasTextOverlay && (
                <div className="hero-text-overlay-wrap">
                  <div className="hero-text-box" style={{ color: slide.textColor }}>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                    <h2 className="hero-title">{slide.title}</h2>
                    <div
                      className="hero-arrow-indicator"
                      title={tooltipText}
                      style={{ color: slide.textColor }}
                    >
                      <div className="arrow-draw-wrapper">
                        <svg
                          className="half-arrow-svg"
                          viewBox="0 0 68 18"
                          width="68"
                          height="18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 9H62L54 3M62 9L54 15"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prev / Next Arrows */}
      <button className="slider-arrow prev" onClick={handlePrev} aria-label="Previous slide">
        <ChevronLeft size={30} />
      </button>
      <button className="slider-arrow next" onClick={handleNext} aria-label="Next slide">
        <ChevronRight size={30} />
      </button>

      {/* Bottom Right Controls (Counter & Pause & View All - matches user's reference image) */}
      <div className="slider-controls-badge">
        <span className="slider-counter">
          {currentSlide + 1}/{activeSlides.length}
        </span>
        <button
          type="button"
          className="slider-btn-icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause slider" : "Play slider"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <CarouselPauseIcon size={12} /> : <CarouselPlayIcon size={12} />}
        </button>
        <button
          type="button"
          className="slider-btn-icon view-all-btn"
          onClick={() => setIsViewAllOpen(true)}
          aria-label="View all slides"
          title="View all"
        >
          <CarouselLayersIcon size={13} />
        </button>
      </div>

      {/* View All Modal Popup (Full-height & line divider matching Image 1) */}
      {isViewAllOpen && (
        <div
          className="view-all-modal-backdrop"
          onClick={() => setIsViewAllOpen(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="view-all-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="View all"
          >
            <div className="view-all-modal-header">
              <h3 className="view-all-modal-title">View all</h3>
              <button
                className="view-all-modal-close"
                onClick={() => setIsViewAllOpen(false)}
                aria-label="Close"
              >
                <X size={26} strokeWidth={1.8} />
              </button>
            </div>

            <div className="view-all-modal-body">
              <div className="view-all-banners-list">
                {activeSlides.map((slide, idx) => {
                  const matchedProd = findProductForSlide(slide);
                  const isProd = !!matchedProd;
                  return (
                    <div
                      key={slide.id}
                      className={`view-all-banner-item ${idx === currentSlide ? 'active' : ''} ${isProd ? 'has-product' : ''}`}
                      onClick={() => handleViewAllItemClick(slide, idx)}
                      title={matchedProd ? `Open ${matchedProd.name} details` : slide.title}
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={slide.img}
                        alt={slide.title}
                        className="view-all-banner-img"
                        loading="lazy"
                      />

                      {/* Left text overlay on banners that have text content */}
                      {slide.hasTextOverlay && (
                        <div className="view-all-banner-txt">
                          <span className="view-all-banner-sub">{slide.subtitle}</span>
                          <span className="view-all-banner-tit">{slide.title}</span>
                        </div>
                      )}

                      {/* Action Pill Badge for direct product navigation */}
                      {matchedProd && (
                        <span className="view-all-banner-badge">
                          View Product Details →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
