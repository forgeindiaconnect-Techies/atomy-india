import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// TEST MODE FLAG: Reset to false for standard 1-month / 1-year duration
export const TEST_MODE_FORCE_2_DAYS = false;

/**
 * Calculates membership expiration state:
 * - 'EXPIRING_SOON': 1 or 2 days left
 * - 'EXPIRED': 0 days left or past date
 * - 'ACTIVE': > 2 days left
 * - null: No membership record
 */
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
  onRenewPress,
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const info = getMembershipExpiryInfo(membership);

  if (isDismissed || !info.status || info.status === 'ACTIVE') {
    return null;
  }

  const isExpired = info.status === 'EXPIRED';

  return (
    <View style={[styles.bannerContainer, isExpired ? styles.bannerExpired : styles.bannerWarning]}>
      <View style={styles.leftCol}>
        <View style={[styles.iconCircle, isExpired ? styles.iconCircleExpired : styles.iconCircleWarning]}>
          <Ionicons
            name={isExpired ? 'alert-circle' : 'time-outline'}
            size={18}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, isExpired ? styles.titleExpired : styles.titleWarning]}>
            {isExpired
              ? `Distributor Plan Expired on ${info.expiryDateStr}`
              : `Distributor Plan Expires in ${info.remainingDays} Day${info.remainingDays === 1 ? '' : 's'} (${info.expiryDateStr})`}
          </Text>
          <Text style={styles.desc} numberOfLines={1}>
            {isExpired
              ? 'Prices reverted to MRP. Reactivate now for DP wholesale.'
              : 'Renew now to maintain wholesale DP pricing & PV credit.'}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionBtn, isExpired ? styles.actionBtnExpired : styles.actionBtnWarning]}
          onPress={onRenewPress}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{isExpired ? 'Reactivate' : 'Renew Plan'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => setIsDismissed(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  bannerWarning: {
    backgroundColor: '#FFFBEB', // Light amber background
    borderBottomColor: '#FDE68A',
  },
  bannerExpired: {
    backgroundColor: '#FEF2F2', // Light red background
    borderBottomColor: '#FECACA',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  iconCircleWarning: {
    backgroundColor: '#D97706',
  },
  iconCircleExpired: {
    backgroundColor: '#DC2626',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
  },
  titleWarning: {
    color: '#92400E',
  },
  titleExpired: {
    color: '#991B1B',
  },
  desc: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  actionBtnWarning: {
    backgroundColor: '#D97706',
  },
  actionBtnExpired: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  dismissBtn: {
    padding: 3,
  },
});
