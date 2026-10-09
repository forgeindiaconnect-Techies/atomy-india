import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import NewLaunchModal from './NewLaunchModal';
import {
  getAdConfig,
  isAdSuppressedForToday,
  setAdSuppressedForToday
} from '../../services/adPromotionService';
import './NewLaunchBadge.css';

export default function NewLaunchBadge({
  onAddToCart,
  onBuyNow,
  currentView = 'home'
}) {
  const [adConfig, setAdConfig] = useState(getAdConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCancelledByUser, setIsCancelledByUser] = useState(false);

  const prevViewRef = useRef(currentView);
  const hasMountedRef = useRef(false);

  // Sync with live admin updates via custom event
  useEffect(() => {
    const handleAdUpdated = (e) => {
      if (e.detail) {
        setAdConfig(e.detail);
      } else {
        setAdConfig(getAdConfig());
      }
    };

    window.addEventListener('atomy:ad-updated', handleAdUpdated);
    return () => window.removeEventListener('atomy:ad-updated', handleAdUpdated);
  }, []);

  // Whenever login or signup happens, immediately show the ad
  useEffect(() => {
    const handleLoginTrigger = () => {
      setIsCancelledByUser(false);
      setIsDismissed(false);
      setIsOpen(true);
    };

    window.addEventListener('atomy:ad-trigger-login', handleLoginTrigger);
    return () => window.removeEventListener('atomy:ad-trigger-login', handleLoginTrigger);
  }, []);

  // 1. Appear whenever the webpage is opening in the browser (initial load on home)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (currentView === 'home' && adConfig.isActive && !isAdSuppressedForToday()) {
        // Small delay to allow initial DOM layout to settle smoothly
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [currentView, adConfig.isActive]);

  // 2. Appear whenever the customer comes to the home page from another page until cancelled
  useEffect(() => {
    const prev = prevViewRef.current;
    prevViewRef.current = currentView;

    if (prev !== 'home' && currentView === 'home') {
      if (adConfig.isActive && !isCancelledByUser && !isAdSuppressedForToday()) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [currentView, isCancelledByUser, adConfig.isActive]);

  // Handle user closing/cancelling the modal
  const handleModalClose = (doNotShowToday) => {
    setIsOpen(false);
    setIsCancelledByUser(true); // User explicitly cancelled it
    if (doNotShowToday) {
      setAdSuppressedForToday(true);
    }
  };

  if (!adConfig.isActive) return null;

  return (
    <>
      {/* Bottom Left Floating Card (persists unless mini-dismissed) */}
      {!isDismissed && (
        <aside
          className="new-launch-floating-card animate-slide-up"
          aria-label="New Product Launch"
          onClick={() => setIsOpen(true)}
          title="Click to view featured launch ad"
        >
          {/* Glow & Pulse Ring */}
          <span className="launch-pulse-ring" aria-hidden="true"></span>

          {/* Dismiss Mini Button */}
          <button
            type="button"
            className="launch-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            title="Hide badge"
            aria-label="Dismiss new launch badge"
          >
            <X size={12} />
          </button>

          {/* Card Content Row */}
          <div className="launch-card-inner">
            {/* Thumbnail with floating badge */}
            <div className="launch-thumb-wrapper">
              <img
                src={adConfig.image || '/images/promotions/new_arrival_adelica.png'}
                alt={adConfig.name}
                className="launch-thumb-img"
              />
              <span className="launch-sparkle-dot">
                <Sparkles size={11} />
              </span>
            </div>

            {/* Text details */}
            <div className="launch-info">
              <div className="launch-tag-row">
                <span className="launch-pill-tag">{adConfig.badge || 'NEW LAUNCH'}</span>
                <span className="launch-brand-tag">{adConfig.brand || 'ATOMY adelica'}</span>
              </div>
              <h4 className="launch-title">{adConfig.name || 'Soft Brow Pencil'}</h4>
              <div className="launch-price-row">
                <span className="launch-price">₹{Number(adConfig.price || 700).toLocaleString('en-IN')}</span>
                <span className="launch-pv">{(adConfig.pv || 4000).toLocaleString('en-IN')} PV</span>
              </div>
            </div>

            {/* Arrow prompt on hover */}
            <div className="launch-arrow-action">
              <ChevronRight size={18} />
            </div>
          </div>
        </aside>
      )}

      {/* Full Showcase Modal (matching user's uploaded reference image) */}
      <NewLaunchModal
        isOpen={isOpen}
        onClose={handleModalClose}
        product={adConfig}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
      />
    </>
  );
}
