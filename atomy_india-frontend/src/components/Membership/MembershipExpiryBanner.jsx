import React, { useState } from 'react';
import { AlertCircle, Clock, X, ArrowRight } from 'lucide-react';
import './MembershipExpiryBanner.css';

// TEST MODE FLAG: Reset to false for standard 1-month / 1-year duration
export const TEST_MODE_FORCE_2_DAYS = false;

export function getMembershipExpiryInfo(membership) {
  if (!membership) {
    return { status: null, remainingDays: 0, expiryDateStr: '' };
  }

  // Temporary 2-day test period override
  if (TEST_MODE_FORCE_2_DAYS) {
    const testExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const expiryDateStr = testExpiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return { status: 'EXPIRING_SOON', remainingDays: 2, expiryDateStr };
  }

  if (!membership.expiryDate) {
    return { status: null, remainingDays: 0, expiryDateStr: '' };
  }

  try {
    const expiry = (typeof membership.expiryDate === 'string' || membership.expiryDate instanceof Date)
      ? new Date(membership.expiryDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const expiryDateStr = expiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (diffMs <= 0 || remainingDays <= 0) {
      return { status: 'EXPIRED', remainingDays: 0, expiryDateStr };
    }
    if (remainingDays <= 2) {
      return { status: 'EXPIRING_SOON', remainingDays, expiryDateStr };
    }
    return { status: 'ACTIVE', remainingDays, expiryDateStr };
  } catch (e) {
    return { status: null, remainingDays: 0, expiryDateStr: '' };
  }
}

export default function MembershipExpiryBanner({
  membership,
  onRenewPress
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const info = getMembershipExpiryInfo(membership);

  if (isDismissed || !info.status || info.status === 'ACTIVE') {
    return null;
  }

  const isExpired = info.status === 'EXPIRED';

  return (
    <div className={`membership-web-banner ${isExpired ? 'banner-expired' : 'banner-warning'}`}>
      <div className="banner-content-container">
        <div className="banner-left-col">
          <div className="banner-icon-badge">
            {isExpired ? <AlertCircle size={18} /> : <Clock size={18} />}
          </div>
          <div className="banner-text-wrap">
            <span className="banner-headline">
              {isExpired
                ? `Distributor Membership Expired on ${info.expiryDateStr}`
                : `Distributor Membership Expiring in ${info.remainingDays} Day${info.remainingDays === 1 ? '' : 's'} (${info.expiryDateStr})`}
            </span>
            <span className="banner-subline">
              {isExpired
                ? 'Product pricing has reverted to retail MRP. Reactivate now to unlock wholesale DP rates and PV accumulation.'
                : 'Renew today to protect your wholesale DP savings and continue accumulating Personal PV points.'}
            </span>
          </div>
        </div>

        <div className="banner-right-actions">
          <button
            type="button"
            className="banner-action-btn"
            onClick={onRenewPress}
          >
            <span>{isExpired ? 'Reactivate Membership' : 'Renew Plan'}</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="banner-close-btn"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss membership alert"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
