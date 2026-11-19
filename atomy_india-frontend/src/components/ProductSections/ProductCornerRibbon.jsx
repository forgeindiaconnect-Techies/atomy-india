import React from 'react';
import { calculateProductPricing, isUserMember } from '../../services/membershipService';
import './ProductSection.css';

/**
 * Determines whether a product qualifies for the corner offer ribbon,
 * and what text to display on it dynamically from the live data flow.
 */
export function getProductRibbonInfo(product, isMember) {
  if (!product) return { showRibbon: false, ribbonText: '', pricing: null };

  // Resolve membership status from prop or active session fallback
  let effectiveIsMember = Boolean(isMember);
  if (isMember === undefined && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('atomy_current_user');
      if (stored) {
        effectiveIsMember = isUserMember(JSON.parse(stored));
      }
    } catch {}
  }

  // Calculate pricing dynamically from the catalog / backend data
  const pricing = calculateProductPricing(product, effectiveIsMember);
  const discountPercent = pricing?.discountPercent || Number(product.discountPercent) || 0;
  const hasOffer = Boolean(pricing?.hasOffer || discountPercent > 0 || product.hasOffer);

  if (effectiveIsMember) {
    // For members: dynamically show 'DP Price' whenever the product provides distributor savings over MRP
    const hasMemberSavings = Boolean(
      hasOffer ||
      (pricing?.mrp && pricing?.dpPrice && pricing.mrp > pricing.dpPrice) ||
      (pricing?.savings && pricing.savings > 0)
    );
    return {
      showRibbon: hasMemberSavings,
      ribbonText: 'DP Price',
      pricing
    };
  }

  // For non-members: dynamically show '{percent}% OFF' only if the product has an active discount
  const hasDiscount = Boolean(hasOffer && discountPercent > 0);
  return {
    showRibbon: hasDiscount,
    ribbonText: `${discountPercent}% OFF`,
    pricing
  };
}

/**
 * Corner Triangle Accent Ribbon:
 * Displays two parallel red diagonal lines with an expanded gap and
 * bold bright red text facing bottom-to-top (-45deg angle).
 */
export default function ProductCornerRibbon({ product, isMember, customText }) {
  const { showRibbon, ribbonText } = getProductRibbonInfo(product, isMember);
  const textToRender = customText || ribbonText;

  if (!showRibbon || !textToRender) return null;

  return (
    <div className="product-img-corner-accent" aria-hidden="true">
      <svg viewBox="0 0 80 80" className="corner-accent-svg">
        <polygon points="6,80 80,6 80,42 42,80" fill="#ffffff" />
        <line x1="6" y1="80" x2="80" y2="6" className="corner-accent-line outer" />
        <line x1="42" y1="80" x2="80" y2="42" className="corner-accent-line inner" />
        <text
          x="51"
          y="51"
          transform="rotate(-45, 51, 51)"
          textAnchor="middle"
          dominantBaseline="central"
          className="corner-accent-text"
        >
          {textToRender}
        </text>
      </svg>
    </div>
  );
}
