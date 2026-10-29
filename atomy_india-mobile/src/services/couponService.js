import { fetchCouponsApi, applyCouponApi } from './api';

const STORAGE_KEY = 'atomy_mobile_coupons';

export const DEFAULT_STORE_COUPONS = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    discount: '10% OFF',
    discountDisplay: '10% OFF',
    title: 'New Member Welcome Voucher',
    description: 'Exclusive 10% instant discount for new comers on their first order across all products.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: true,
  },
  {
    id: 'cpn-hemohim20',
    code: 'HEMOHIM20',
    discount: '20% OFF',
    discountDisplay: '20% OFF',
    title: 'HemoHIM Immunity Special Voucher',
    description: 'Special 20% discount on authentic Atomy HemoHIM health supplements.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'PERCENTAGE',
    discountValue: 20,
    categoryScope: 'HEALTH',
    targetProduct: 'HEMOHIM',
    firstOrderOnly: false,
  },
  {
    id: 'cpn-festive500',
    code: 'FESTIVE500',
    discount: '₹ 500 OFF',
    discountDisplay: '₹ 500 OFF',
    title: 'Festive Season Savings Voucher',
    description: 'Flat ₹ 500 discount on cart value above ₹ 5,000 across all catalog items.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 5000,
    discountType: 'FLAT',
    discountValue: 500,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false,
  },
  {
    id: 'cpn-freeship',
    code: 'FREESHIP',
    discount: 'FREE DELIVERY',
    discountDisplay: 'FREE DELIVERY',
    title: 'Zero-Cost Free Doorstep Delivery',
    description: 'Free shipping on orders across India without minimum purchase limit.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'FREE_SHIPPING',
    discountValue: 0,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false,
  },
];

/**
 * Fetch all active coupons from backend with local storage fallback
 */
export async function fetchCouponsFromBackend() {
  try {
    const data = await fetchCouponsApi();
    if (Array.isArray(data) && data.length > 0) {
      const customerFormat = data.map((c) => ({
        id: c.id,
        code: c.code,
        discount: c.discountDisplay || `${c.discountValue}% OFF`,
        title: c.title || `${c.code} Discount Coupon`,
        description: c.description || 'Special discount coupon eligible for order checkout',
        validTill: c.validTill || '31 Dec 2026',
        status: c.status === 'ACTIVE' || c.status === 'Active' ? 'Active' : 'Inactive',
        minOrderValue: Number(c.minOrderValue) || 0,
        discountType: c.discountType || 'PERCENTAGE',
        discountValue: Number(c.discountValue) || 0,
        categoryScope: c.categoryScope || 'ALL',
        targetProduct: c.targetProduct || 'ALL',
        firstOrderOnly: Boolean(c.firstOrderOnly || c.code === 'WELCOME10'),
      }));

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customerFormat));
        }
      } catch (e) {}

      return customerFormat;
    }
  } catch (err) {
    console.warn('Mobile coupon fetch warning:', err.message);
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) {}

  return DEFAULT_STORE_COUPONS;
}

/**
 * Validate and apply coupon code to cart amount
 */
export async function applyCouponBackend(code, cartAmount = 0, cartItems = [], isFirstOrder = true) {
  try {
    const res = await applyCouponApi(code, cartAmount, cartItems, isFirstOrder);
    if (res && res.valid !== undefined) {
      return res;
    }
  } catch (err) {
    console.warn('Mobile apply coupon API warning:', err?.message || err);
  }

  // Local fallback validation
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  if (cleanCode === 'WELCOME10') {
    if (isFirstOrder === false) {
      return {
        valid: false,
        message: 'Coupon "WELCOME10" is exclusively reserved for new comers on their first order.',
      };
    }
    const discount = Math.round(cartAmount * 0.1);
    return {
      valid: true,
      code: 'WELCOME10',
      discountAmount: discount,
      discountType: 'PERCENTAGE',
      title: 'New Member Welcome Voucher',
      message: '🎉 Welcome voucher applied! 10% discount deducted from your first order.',
    };
  }

  if (cleanCode === 'HEMOHIM20') {
    const hasHemohim = Array.isArray(cartItems) && cartItems.some((it) => {
      const n = (it.name || it.title || '').toLowerCase();
      const t = (it.tags || '').toLowerCase();
      const c = (it.category || '').toLowerCase();
      return n.includes('hemohim') || n.includes('hemo him') || t.includes('hemohim') || c.includes('hemohim');
    });

    if (!hasHemohim) {
      return {
        valid: false,
        message: 'Coupon "HEMOHIM20" is valid only when purchasing Atomy HemoHIM products.',
      };
    }

    let hemohimSubtotal = 0;
    cartItems.forEach((it) => {
      const n = (it.name || it.title || '').toLowerCase();
      const t = (it.tags || '').toLowerCase();
      if (n.includes('hemohim') || n.includes('hemo him') || t.includes('hemohim')) {
        hemohimSubtotal += (Number(it.price) || 0) * (it.qty || 1);
      }
    });

    const baseAmount = hemohimSubtotal > 0 ? hemohimSubtotal : cartAmount;
    const discount = Math.round(baseAmount * 0.2);
    return {
      valid: true,
      code: 'HEMOHIM20',
      discountAmount: discount,
      discountType: 'PERCENTAGE',
      title: 'HemoHIM Immunity Special Voucher',
      message: '🌿 20% HemoHIM Immunity discount applied successfully!',
    };
  }

  if (cleanCode === 'FESTIVE500') {
    if (cartAmount < 5000) {
      return {
        valid: false,
        message: 'FESTIVE500 requires a minimum order value of ₹ 5,000.00.',
      };
    }
    return {
      valid: true,
      code: 'FESTIVE500',
      discountAmount: 500,
      discountType: 'FLAT',
      title: 'Festive Season Savings Voucher',
      message: '✨ ₹ 500 festive discount applied successfully!',
    };
  }

  if (cleanCode === 'FREESHIP') {
    return {
      valid: true,
      code: 'FREESHIP',
      isFreeShipping: true,
      discountAmount: 0,
      discountType: 'FREE_SHIPPING',
      title: 'Zero-Cost Free Doorstep Delivery',
      message: '🚚 Free shipping coupon applied successfully! Doorstep delivery fee waived.',
    };
  }

  return { valid: false, message: 'Invalid or expired coupon code. Please verify the code.' };
}
