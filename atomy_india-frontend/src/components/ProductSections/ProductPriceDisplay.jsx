import React from 'react';
import { calculateProductPricing } from '../../services/membershipService';
import './ProductPriceDisplay.css';

export default function ProductPriceDisplay({ product, isMember = false, size = 'medium' }) {
  const pricing = calculateProductPricing(product, isMember);

  if (isMember) {
    // ATOMY MEMBER WITH ACTIVE MEMBERSHIP: Shows Wholesale DP Price instead of MRP, and displays PV!
    return (
      <div className={`product-price-block is-member ${size}`}>
        <div className="price-strike-row">
          <span className="price-mrp-label">MRP</span>
          <span className="price-original">
            ₹ {pricing.mrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="price-percent member-dp-save">
            DP Price
          </span>
        </div>

        <p className="product-price member-dp-price">
          <span className="dp-price-amount">
            ₹ {pricing.activePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>

        <p className="product-pv-note active-member-pv">
          {pricing.pv.toLocaleString('en-IN')} PV
        </p>
      </div>
    );
  }

  // NON-MEMBER / PUBLIC (NOT SIGNED IN OR NO MEMBERSHIP):
  // Shows MRP / Retail price and PV value, HIDES DP value!
  return (
    <div className={`product-price-block is-retail ${size}`}>
      {pricing.hasOffer && (
        <div className="price-strike-row">
          <span className="price-mrp-label">MRP</span>
          <span className="price-original">
            ₹ {pricing.mrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="price-percent">{pricing.discountPercent}% off</span>
        </div>
      )}

      <p className="product-price">
        {!pricing.hasOffer && <span className="price-mrp-label" style={{ marginRight: '5px' }}>MRP</span>}
        ₹ {pricing.activePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      {/* PV is always visible even on public / non-member page */}
      <p className="product-pv-note active-member-pv">
        {pricing.pv.toLocaleString('en-IN')} PV
      </p>

      {/* Distributor Price membership unlock hint */}
      <p
        className="product-pv-note locked-pv-hint"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('atomy:navigate-view', { detail: { view: 'membership' } }));
        }}
        title="Click to view Atomy Distributor Membership page"
      >
        Join Membership to get the Distributor Price
      </p>
    </div>
  );
}
