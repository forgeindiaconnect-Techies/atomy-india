import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import './NewLaunchBadge.css';

export default function NewLaunchModal({ 
  isOpen, 
  onClose, 
  product,
  onAddToCart,
  onBuyNow 
}) {
  const [doNotShowToday, setDoNotShowToday] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, doNotShowToday]);

  if (!isOpen || !product) return null;

  const handleDismiss = () => {
    onClose && onClose(doNotShowToday);
  };

  const handleCartClick = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id || 'D00620',
        name: product.name || 'Adelica Soft Brow Pencil - Gray',
        price: product.price || 700,
        pv: product.pv || 4000,
        image: product.image
      }, 1);
    }
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow({
        id: product.id || 'D00620',
        name: product.name || 'Adelica Soft Brow Pencil - Gray',
        price: product.price || 700,
        pv: product.pv || 4000,
        image: product.image
      }, 1);
    } else if (onAddToCart) {
      onAddToCart({
        id: product.id || 'D00620',
        name: product.name || 'Adelica Soft Brow Pencil - Gray',
        price: product.price || 700,
        pv: product.pv || 4000,
        image: product.image
      }, 1);
    }
    handleDismiss();
  };

  return (
    <div className="new-launch-overlay" onClick={handleDismiss} role="dialog" aria-modal="true">
      <div 
        className="new-launch-modal-card animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster Image Container matching user's reference image */}
        <div className="launch-poster-container">
          <img 
            src={product.image || '/images/promotions/new_arrival_adelica.png'} 
            alt={product.name || 'Adelica Soft Brow Pencil - Gray'}
            className="launch-poster-img"
          />
        </div>

        {/* Quick Action Bar (Cart & Buy) */}
        <div className="launch-modal-action-bar">
          <button 
            type="button"
            className="launch-btn-cart"
            onClick={handleCartClick}
          >
            <ShoppingCart size={17} />
            <span>Add to Cart</span>
          </button>
          <button 
            type="button"
            className="launch-btn-buy"
            onClick={handleBuyNowClick}
          >
            <span>Order Now (₹{product.price || 700})</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Bottom Bar matching user's exact image:
            Left: [ ] Do not show again today
            Right: Close (X) icon */}
        <div className="launch-modal-bottom-bar">
          <label className="launch-do-not-show-label">
            <input
              type="checkbox"
              className="launch-do-not-show-checkbox"
              checked={doNotShowToday}
              onChange={(e) => setDoNotShowToday(e.target.checked)}
            />
            <span className="launch-do-not-show-text">Do not show again today</span>
          </label>

          <button
            type="button"
            className="launch-bottom-close-btn"
            onClick={handleDismiss}
            aria-label="Close ad"
            title="Close"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
