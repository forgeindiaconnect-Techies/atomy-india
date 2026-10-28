import { fetchCouponsApi, applyCouponApi } from './api';

const STORAGE_KEY = 'atomy_mobile_coupons';

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
        status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
        minOrderValue: Number(c.minOrderValue) || 0,
        discountType: c.discountType || 'PERCENTAGE',
        discountValue: Number(c.discountValue) || 0,
        categoryScope: c.categoryScope || 'ALL',
        targetProduct: c.targetProduct || 'ALL',
        firstOrderOnly: Boolean(c.firstOrderOnly),
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
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {}

  return [
    {
      id: 'cpn-welcome',
      code: 'WELCOME10',
      discount: '10% OFF',
      title: 'New Member Welcome Discount',
      description: 'Get 10% instant discount on your order with no minimum limit.',
      validTill: '31 Dec 2026',
      status: 'Active',
      minOrderValue: 0,
      discountType: 'PERCENTAGE',
      discountValue: 10,
    },
    {
      id: 'cpn-festive',
      code: 'FESTIVE500',
      discount: '₹ 500 OFF',
      title: 'Festive Season Special Savings',
      description: 'Flat ₹ 500 discount on cart value above ₹ 5,000.',
      validTill: '31 Dec 2026',
      status: 'Active',
      minOrderValue: 5000,
      discountType: 'FIXED',
      discountValue: 500,
    },
  ];
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
    console.warn('Mobile apply coupon warning:', err.message);
  }

  // Local fallback validation
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  if (cleanCode === 'WELCOME10') {
    const discount = Math.round(cartAmount * 0.1);
    return {
      valid: true,
      code: 'WELCOME10',
      discountAmount: discount,
      message: '10% welcome discount applied successfully!',
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
      message: '₹ 500 festive discount applied successfully!',
    };
  }

  if (cleanCode === 'FREESHIP') {
    return {
      valid: true,
      code: 'FREESHIP',
      isFreeShipping: true,
      discountAmount: 0,
      message: 'Free shipping coupon applied successfully!',
    };
  }

  return { valid: false, message: 'Invalid or expired coupon code. Please verify the code.' };
}
