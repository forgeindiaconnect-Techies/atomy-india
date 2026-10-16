import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, ArrowRight } from 'lucide-react';
import { isAdSuppressedForToday, setAdSuppressedForToday } from '../../services/adPromotionService';
import './NewLaunchBadge.css';

export default function NewLaunchModal({ 
  isOpen, 
  onClose, 
  product,
  onAddToCart,
  onBuyNow 
}) {
  const [doNotShowToday, setDoNotShowToday] = useState(() => isAdSuppressedForToday());
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [bannersPerView, setBannersPerView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 960) return 2;
      return 3;
    }
    return 3;
  });

  // Extract active ads list safely
  const rawAds = Array.isArray(product?.ads) && product.ads.length > 0
    ? product.ads
    : product ? [product] : [];

  const adsList = rawAds.filter(a => a.isActive !== false);
  const displayAds = adsList.length > 0 ? adsList : rawAds;
  const totalAds = displayAds.length;

  // Sync checkbox state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDoNotShowToday(isAdSuppressedForToday());
    }
  }, [isOpen]);

  // Responsive bannersPerView listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBannersPerView(1);
      } else if (window.innerWidth < 960) {
        setBannersPerView(2);
      } else {
        setBannersPerView(3);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDismiss = () => {
    onClose && onClose(doNotShowToday);
  };

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, doNotShowToday]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen && product) {
      document.body.classList.add('ad-modal-open');
    } else {
      document.body.classList.remove('ad-modal-open');
    }
    return () => {
      document.body.classList.remove('ad-modal-open');
    };
  }, [isOpen, product]);

  // Auto-play continuous loop every 4.5 seconds (paused on hover)
  useEffect(() => {
    if (!isOpen || isPaused || totalAds <= 1) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalAds);
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, totalAds]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + totalAds) % totalAds);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % totalAds);
  };

  // Early return only AFTER all hooks are defined
  if (!isOpen || !product) return null;

  const handleBannerClick = (ad) => {
    if (Number(ad.price) > 0) {
      if (onAddToCart) {
        onAddToCart({
          id: ad.id || 'D00620',
          name: ad.name || ad.title || 'Atomy Product',
          price: ad.price || 700,
          pv: ad.pv || 4000,
          image: ad.image
        }, 1);
      }
    } else if (ad.link) {
      if (ad.link.startsWith('http')) {
        window.open(ad.link, '_blank');
      } else {
        window.location.hash = ad.link;
      }
      handleDismiss();
    }
  };

  const handleActionClick = (e, ad) => {
    e.stopPropagation();
    if (Number(ad.price) > 0) {
      if (onBuyNow) {
        onBuyNow({
          id: ad.id || 'D00620',
          name: ad.name || ad.title || 'Atomy Product',
          price: ad.price || 700,
          pv: ad.pv || 4000,
          image: ad.image
        }, 1);
      } else if (onAddToCart) {
        onAddToCart({
          id: ad.id || 'D00620',
          name: ad.name || ad.title || 'Atomy Product',
          price: ad.price || 700,
          pv: ad.pv || 4000,
          image: ad.image
        }, 1);
      }
      handleDismiss();
    } else if (ad.link) {
      if (ad.link.startsWith('http')) {
        window.open(ad.link, '_blank');
      } else {
        window.location.hash = ad.link;
      }
      handleDismiss();
    } else {
      handleDismiss();
    }
  };

  // Visible banners window in continuous circular loop
  const count = Math.min(bannersPerView, totalAds);
  const visibleBanners = [];
  for (let i = 0; i < count; i++) {
    const idx = (slideIndex + i) % totalAds;
    visibleBanners.push({
      ...displayAds[idx],
      _slotIndex: i,
      _virtualIndex: idx
    });
  }

  return (
    <div className="new-launch-overlay" onClick={handleDismiss} role="dialog" aria-modal="true">
      <div 
        className="new-launch-multi-modal animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel & Multi-Banner Display matching user's Image 2 */}
        <div className="launch-multi-carousel-wrapper">
          {/* Navigation Arrow Left (loops continuously) */}
          {totalAds > 1 && (
            <button
              type="button"
              className="launch-multi-nav-btn launch-multi-nav-prev"
              onClick={handlePrev}
              aria-label="Previous promotional banners"
            >
              <ChevronLeft size={28} strokeWidth={2.2} />
            </button>
          )}

          {/* Banners Grid Track: Displays up to 3 banners side-by-side matching Image 2 */}
          <div 
            className="launch-multi-banners-grid"
            style={{
              gridTemplateColumns: `repeat(${visibleBanners.length}, 1fr)`
            }}
          >
            {visibleBanners.map((ad, idx) => (
              <div 
                key={`${ad.id || idx}-${slideIndex}-${ad._slotIndex}`} 
                className="launch-multi-banner-column"
                onClick={() => handleBannerClick(ad)}
              >
                <div className="launch-banner-img-wrap">
                  <img 
                    src={ad.image || '/images/promotions/new_arrival_adelica.png'} 
                    alt={ad.name || ad.title || 'Atomy Promotion'}
                    className="launch-multi-banner-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/promotions/new_arrival_adelica.png';
                    }}
                  />
                </div>

                {/* Optional mini quick-action strip on hover/card */}
                {(ad.actionText || Number(ad.price) > 0) && (
                  <div className="launch-banner-action-bar">
                    <button
                      type="button"
                      className="launch-banner-action-btn"
                      onClick={(e) => handleActionClick(e, ad)}
                    >
                      {Number(ad.price) > 0 ? (
                        <>
                          <ShoppingCart size={14} />
                          <span>Order ₹{ad.price}</span>
                        </>
                      ) : (
                        <>
                          <span>{ad.actionText || 'Explore Now'}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrow Right (loops continuously) */}
          {totalAds > 1 && (
            <button
              type="button"
              className="launch-multi-nav-btn launch-multi-nav-next"
              onClick={handleNext}
              aria-label="Next promotional banners"
            >
              <ChevronRight size={28} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Pagination Dots indicator: loops all slides continuously ● ○ ○ ○ */}
        {totalAds > 1 && (
          <div className="launch-multi-dots-bar">
            {displayAds.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`launch-multi-dot ${dotIdx === (slideIndex % totalAds) ? 'active' : ''}`}
                onClick={() => setSlideIndex(dotIdx)}
                aria-label={`Go to banner slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Bar matching user's Image 2:
            Left: [ ] Do not show again today
            Right: Close (X) icon */}
        <div className="launch-modal-bottom-bar">
          <label 
            className="launch-do-not-show-label"
            onClick={(e) => {
              e.preventDefault();
              handleDismiss();
            }}
            title="Dismiss promotional banners"
          >
            <input
              type="checkbox"
              className="launch-do-not-show-checkbox"
              checked={false}
              readOnly
            />
            <span className="launch-do-not-show-text">Don't show again</span>
          </label>

          <button
            type="button"
            className="launch-bottom-close-btn"
            onClick={handleDismiss}
            aria-label="Close ad"
            title="Close"
          >
            <X size={26} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
