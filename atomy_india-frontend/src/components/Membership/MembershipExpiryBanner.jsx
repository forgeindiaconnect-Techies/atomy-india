import React, { useState } from 'react';
import { AlertCircle, Clock, X, ArrowRight } from 'lucide-react';
import './MembershipExpiryBanner.css';

// TEST MODE FLAG: Reset to false for standard 1-month / 1-year duration
export const TEST_MODE_FORCE_2_DAYS = false;

export function getMembershipExpiryInfo(membership) {
  if (!membership) {
    return { status: null, remainingDays: 0, expiryDateStr: '', isToday: false };
  }

  // Temporary 2-day test period override
  if (TEST_MODE_FORCE_2_DAYS) {
    const testExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const expiryDateStr = testExpiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return { status: 'EXPIRING_SOON', remainingDays: 2, expiryDateStr, isToday: false };
  }

  let expiryDate = (typeof membership.expiryDate === 'string' || membership.expiryDate instanceof Date)
    ? membership.expiryDate
    : null;

  if (!expiryDate) {
    const rawStart = (typeof membership.startDate === 'string' || membership.startDate instanceof Date)
      ? membership.startDate
      : (typeof membership.createdAt === 'string' ? membership.createdAt : (typeof membership.joinedAt === 'string' ? membership.joinedAt : null));
    if (rawStart) {
      try {
        const s = new Date(rawStart);
        if (!isNaN(s.getTime())) {
          if (String(membership.plan || '').toUpperCase() === 'MONTHLY') s.setMonth(s.getMonth() + 1);
          else s.setFullYear(s.getFullYear() + 1);
          expiryDate = s.toISOString();
        }
      } catch {}
    }
  }

  if (!expiryDate) {
    return { status: null, remainingDays: 0, expiryDateStr: '', isToday: false };
  }

  try {
    let expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return { status: null, remainingDays: 0, expiryDateStr: '', isToday: false };
    }

    // If expiry date string has no time or is YYYY-MM-DD, give full validity through end-of-day 23:59:59
    if (typeof expiryDate === 'string' && (expiryDate.length === 10 || !expiryDate.includes(':'))) {
      expiry.setHours(23, 59, 59, 999);
    }

    const now = new Date();

    const isToday = (
      expiry.getFullYear() === now.getFullYear() &&
      expiry.getMonth() === now.getMonth() &&
      expiry.getDate() === now.getDate()
    );

    const diffMs = expiry.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const expiryDateStr = expiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // If time has completely passed and today has concluded, it is EXPIRED
    if (diffMs <= 0 && !isToday) {
      return { status: 'EXPIRED', remainingDays: 0, expiryDateStr, isToday: false };
    }
    // If today is the expiration day, the member remains active throughout today but receives warning
    if (isToday) {
      return { status: 'EXPIRING_SOON', remainingDays: 0, expiryDateStr, isToday: true };
    }
    if (remainingDays <= 2) {
      return { status: 'EXPIRING_SOON', remainingDays, expiryDateStr, isToday: false };
    }
    return { status: 'ACTIVE', remainingDays, expiryDateStr, isToday: false };
  } catch (e) {
    return { status: null, remainingDays: 0, expiryDateStr: '', isToday: false };
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
                ? (info.isToday
                    ? 'Distributor Membership Expired Today'
                    : `Distributor Membership Expired on ${info.expiryDateStr}`)
                : (info.isToday
                    ? `Distributor Membership Expiring Today (${info.expiryDateStr})`
                    : `Distributor Membership Expiring in ${info.remainingDays} Day${info.remainingDays === 1 ? '' : 's'} (${info.expiryDateStr})`)}
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
