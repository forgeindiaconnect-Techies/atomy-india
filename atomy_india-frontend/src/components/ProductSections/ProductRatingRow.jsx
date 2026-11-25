import React, { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { getStoredRatingsSummary, fetchRatingsSummary } from '../../services/api';

/**
 * Reads the actual dynamic rating and reviews count from the database
 */
export function getProductRatingInfo(product, summaryMap = null) {
  if (!product) return { score: '0.0', numericScore: 0, count: 0 };

  const pId = String(product.id || product.code || '').trim();
  const summary = summaryMap || getStoredRatingsSummary();

  // 1. Look up in MongoDB ratings summary map
  if (summary && typeof summary === 'object') {
    const item = summary[pId] || summary[pId.toLowerCase()] || summary[pId.toUpperCase()];
    if (item) {
      const count = typeof item.reviewsCount === 'number' ? item.reviewsCount : parseInt(item.reviewsCount || 0, 10);
      const scoreNum = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || 0);
      return {
        score: count > 0 && scoreNum > 0 ? scoreNum.toFixed(1) : '0.0',
        numericScore: count > 0 ? scoreNum : 0,
        count: Math.max(0, count)
      };
    }
  }

  // 2. Check if product object itself has DB fields
  if (product.reviewsCount !== undefined || product.rating !== undefined) {
    const count = typeof product.reviewsCount === 'number' ? product.reviewsCount : parseInt(product.reviewsCount || 0, 10);
    const scoreNum = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating || 0);
    return {
      score: count > 0 && scoreNum > 0 ? scoreNum.toFixed(1) : '0.0',
      numericScore: count > 0 ? scoreNum : 0,
      count: Math.max(0, count)
    };
  }

  // 3. Defaults strictly to 0 reviews & 0.0 rating if not yet reviewed in DB
  return {
    score: '0.0',
    numericScore: 0,
    count: 0
  };
}

export default function ProductRatingRow({ product, className = '' }) {
  const [summary, setSummary] = useState(() => getStoredRatingsSummary());

  useEffect(() => {
    // Initial fetch from backend MongoDB API
    fetchRatingsSummary().then((data) => {
      if (data) setSummary(data);
    });

    const handleUpdate = (e) => {
      if (e?.detail) {
        setSummary(e.detail);
      } else {
        setSummary(getStoredRatingsSummary());
      }
    };

    window.addEventListener('atomy:ratings-summary-updated', handleUpdate);
    window.addEventListener('atomy:review-submitted', handleUpdate);
    window.addEventListener('atomy:product-stats-updated', handleUpdate);

    return () => {
      window.removeEventListener('atomy:ratings-summary-updated', handleUpdate);
      window.removeEventListener('atomy:review-submitted', handleUpdate);
      window.removeEventListener('atomy:product-stats-updated', handleUpdate);
    };
  }, []);

  const ratingInfo = getProductRatingInfo(product, summary);
  const score = ratingInfo.numericScore;
  const hasReviews = ratingInfo.count > 0;

  return (
    <div
      className={`product-rating-row ${className}`}
      title={hasReviews ? `${ratingInfo.score} out of 5 stars (${ratingInfo.count} reviews in database)` : 'No reviews yet in database'}
      onClick={(e) => {
        e.stopPropagation();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('atomy:open-product-review', { detail: { product } }));
        }
      }}
    >
      <span className="product-rating-score notranslate" translate="no">
        {ratingInfo.score}
      </span>

      <span className="product-rating-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starIdx) => {
          if (hasReviews && score >= starIdx) {
            return (
              <Star
                key={starIdx}
                size={13}
                fill="#de7921"
                stroke="#de7921"
                className="rating-star-icon"
              />
            );
          } else if (hasReviews && score >= starIdx - 0.5) {
            return (
              <StarHalf
                key={starIdx}
                size={13}
                fill="#de7921"
                stroke="#de7921"
                className="rating-star-icon"
              />
            );
          } else {
            return (
              <Star
                key={starIdx}
                size={13}
                fill="none"
                stroke="#de7921"
                strokeWidth={1.6}
                className="rating-star-icon"
              />
            );
          }
        })}
      </span>

      <span className="product-rating-count notranslate" translate="no">
        ({ratingInfo.count})
      </span>
    </div>
  );
}
