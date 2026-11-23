import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStoredRatingsSummary, fetchRatingsSummary } from '../../services/api';

/**
 * Reads dynamic database rating and review count from MongoDB
 */
export function getProductRatingInfo(product, summaryMap = null) {
  if (!product) return { score: '0.0', numericScore: 0, count: 0 };

  const pId = String(product.id || product.code || '').trim();
  const summary = summaryMap || getStoredRatingsSummary();

  if (summary && typeof summary === 'object') {
    const item = summary[pId] || summary[pId.toLowerCase()] || summary[pId.toUpperCase()];
    if (item) {
      const count = typeof item.reviewsCount === 'number' ? item.reviewsCount : parseInt(item.reviewsCount || 0, 10);
      const scoreNum = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || 0);
      return {
        score: count > 0 && scoreNum > 0 ? scoreNum.toFixed(1) : '0.0',
        numericScore: count > 0 ? scoreNum : 0,
        count: Math.max(0, count),
      };
    }
  }

  if (product.reviewsCount !== undefined || product.rating !== undefined) {
    const count = typeof product.reviewsCount === 'number' ? product.reviewsCount : parseInt(product.reviewsCount || 0, 10);
    const scoreNum = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating || 0);
    return {
      score: count > 0 && scoreNum > 0 ? scoreNum.toFixed(1) : '0.0',
      numericScore: count > 0 ? scoreNum : 0,
      count: Math.max(0, count),
    };
  }

  return {
    score: '0.0',
    numericScore: 0,
    count: 0,
  };
}

export default function ProductRatingRow({ product, onPress, style }) {
  const [summary, setSummary] = useState(() => getStoredRatingsSummary());

  useEffect(() => {
    fetchRatingsSummary().then((data) => {
      if (data) setSummary(data);
    });
  }, []);

  const ratingInfo = getProductRatingInfo(product, summary);
  const score = ratingInfo.numericScore;
  const hasReviews = ratingInfo.count > 0;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
      onPress={() => onPress && onPress(product)}
    >
      <Text style={styles.scoreText}>{ratingInfo.score}</Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((starIdx) => {
          let iconName = 'star-outline';
          let starColor = hasReviews ? '#DE7921' : '#CBD5E1';

          if (hasReviews && score >= starIdx) {
            iconName = 'star';
            starColor = '#DE7921';
          } else if (hasReviews && score >= starIdx - 0.5) {
            iconName = 'star-half';
            starColor = '#DE7921';
          }

          return (
            <Ionicons
              key={starIdx}
              name={iconName}
              size={12}
              color={starColor}
              style={styles.starIcon}
            />
          );
        })}
      </View>

      <Text style={styles.countText}>({ratingInfo.count})</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1111',
    marginRight: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  starIcon: {
    marginHorizontal: 0.5,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007185',
    marginLeft: 2,
  },
});
