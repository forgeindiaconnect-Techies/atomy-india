/**
 * couponService.js (Storefront)
 * Full CRUD synchronization with Spring Boot MongoDB Atlas Backend with bulletproof local fallback
 */

export function getApiBase() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8085/api';
  }
  const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-lqsy.onrender.com/api').trim().replace(/\/+$/, '').replace(/atomy[-_]india(\.onrender\.com)/i, 'atomy-india-lqsy$1');
  return rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
}

const STORAGE_KEY = 'atomy_admin_coupons';
const CUSTOMER_STORAGE_KEY = 'atomy_coupons';

export const DEFAULT_STORE_COUPONS = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    discount: '10% OFF',
    discountDisplay: '10% OFF',
    title: 'New Member Welcome Voucher',
    description: 'Get 10% instant discount on your first order. Exclusive for new customer registrations.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: true
  },
  {
    id: 'cpn-hemohim20',
    code: 'HEMOHIM20',
    discount: '20% OFF',
    discountDisplay: '20% OFF',
    title: 'HemoHIM Immunity Special',
    description: 'Special 20% discount on genuine Atomy HemoHIM products.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'PERCENTAGE',
    discountValue: 20,
    categoryScope: 'HEALTH',
    targetProduct: 'HEMOHIM',
    firstOrderOnly: false
  },
  {
    id: 'cpn-festive500',
    code: 'FESTIVE500',
    discount: '₹ 500 OFF',
    discountDisplay: '₹ 500 OFF',
    title: 'Festive Season Savings Voucher',
    description: 'Flat ₹ 500 discount on cart value above ₹ 5,000.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 5000,
    discountType: 'FLAT',
    discountValue: 500,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false
  },
  {
    id: 'cpn-freeship',
    code: 'FREESHIP',
    discount: 'FREE DELIVERY',
    discountDisplay: 'FREE DELIVERY',
    title: 'Zero-Cost Free Doorstep Delivery',
    description: 'Free shipping on orders across India without minimum limit.',
    validTill: '31 Dec 2026',
    status: 'Active',
    minOrderValue: 0,
    discountType: 'FREE_SHIPPING',
    discountValue: 0,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false
  }
];

export async function fetchCouponsFromBackend() {
  const apiBase = getApiBase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiBase}/coupons`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        const customerFormat = data.map(c => ({
          id: c.id,
          code: c.code,
          discount: c.discountDisplay || `${c.discountValue}% OFF`,
          title: c.title,
          description: c.description,
          validTill: c.validTill,
          status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
          minOrderValue: c.minOrderValue,
          discountType: c.discountType,
          discountValue: c.discountValue,
          categoryScope: c.categoryScope || 'ALL',
          targetProduct: c.targetProduct || 'ALL',
          firstOrderOnly: c.firstOrderOnly || false
        }));
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerFormat));
        window.dispatchEvent(new Event('atomy_coupons_updated'));
        return customerFormat;
      }
    }
  } catch (err) {
    console.warn('Backend fetch coupons warning:', err?.message || err);
  }

  try {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Fallback to official default coupons so UI is never empty
  return DEFAULT_STORE_COUPONS;
}

/**
 * Validate and apply coupon with remote verification + instant local rule evaluation fallback
 */
export async function applyCouponBackend(code, cartAmount = 0, cartItems = [], isFirstOrder = true) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  const apiBase = getApiBase();

  // 1. Attempt fast remote backend verification (with 3.5s timeout)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiBase}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cleanCode, cartAmount, cartItems, isFirstOrder }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.valid !== undefined) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Remote coupon apply timeout/warning, falling back to local engine:', err?.message || err);
  }

  // 2. High-Reliability Local Rule Evaluation Fallback
  // Check stored admin coupons first
  try {
    const storedAdmin = localStorage.getItem(STORAGE_KEY);
    if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      const match = parsed.find(c => (c.code || '').toUpperCase() === cleanCode);
      if (match) {
        if (match.status && match.status !== 'ACTIVE') {
          return { valid: false, message: `Coupon "${cleanCode}" is currently inactive or expired.` };
        }
        if (match.minOrderValue && cartAmount < match.minOrderValue) {
          return { valid: false, message: `Coupon "${cleanCode}" requires a minimum cart value of ₹${match.minOrderValue}.` };
        }
        if (match.firstOrderOnly && isFirstOrder === false) {
          return { valid: false, message: `Coupon "${cleanCode}" is valid for first-time orders only.` };
        }
        let discount = 0;
        if (match.discountType === 'PERCENTAGE') {
          discount = Math.round((cartAmount * (match.discountValue || 10)) / 100);
          if (match.maxDiscountCap && discount > match.maxDiscountCap) discount = match.maxDiscountCap;
        } else if (match.discountType === 'FLAT' || match.discountType === 'FIXED') {
          discount = Math.min(cartAmount, match.discountValue || 0);
        }
        return {
          valid: true,
          code: cleanCode,
          title: match.title,
          discountDisplay: match.discountDisplay || `₹ ${discount} OFF`,
          discountAmount: discount,
          discountType: match.discountType || 'FLAT',
          message: `Coupon "${cleanCode}" applied successfully!`
        };
      }
    }
  } catch {}

  // 3. Fallback evaluation for core system coupons
  if (cleanCode === 'WELCOME10') {
    if (isFirstOrder === false) {
      return {
        valid: false,
        message: 'Coupon "WELCOME10" is restricted to first-time orders only.'
      };
    }
    const discountAmount = Math.round(cartAmount * 0.1);
    return {
      valid: true,
      code: 'WELCOME10',
      title: 'New Member Welcome Voucher',
      discountDisplay: '10% OFF',
      discountAmount: discountAmount,
      discountType: 'PERCENTAGE',
      message: '🎉 Welcome voucher applied! 10% discount deducted from your order.'
    };
  }

  if (cleanCode === 'HEMOHIM20') {
    const hasHemohim = Array.isArray(cartItems) && cartItems.some(it => {
      const n = (it.name || it.title || '').toLowerCase();
      const t = (it.tags || '').toLowerCase();
      return n.includes('hemohim') || n.includes('hemo him') || t.includes('hemohim');
    });

    if (!hasHemohim) {
      return {
        valid: false,
        message: 'Coupon "HEMOHIM20" is only applicable to orders containing HemoHIM products.'
      };
    }

    const hemohimSubtotal = cartItems
      .filter(it => {
        const n = (it.name || it.title || '').toLowerCase();
        return n.includes('hemohim') || n.includes('hemo him');
      })
      .reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.qty || it.quantity) || 1)), 0);

    const baseAmount = hemohimSubtotal > 0 ? hemohimSubtotal : cartAmount;
    const discountAmount = Math.round(baseAmount * 0.2);

    return {
      valid: true,
      code: 'HEMOHIM20',
      title: 'HemoHIM Immunity Special',
      discountDisplay: '20% OFF',
      discountAmount,
      discountType: 'PERCENTAGE',
      targetProduct: 'HEMOHIM',
      message: '🌿 HemoHIM 20% discount applied successfully!'
    };
  }

  if (cleanCode === 'FESTIVE500') {
    if (cartAmount < 5000) {
      return {
        valid: false,
        message: 'Coupon "FESTIVE500" requires a minimum order value of ₹5,000.00.'
      };
    }
    return {
      valid: true,
      code: 'FESTIVE500',
      title: 'Festive Season Savings',
      discountDisplay: '₹ 500 OFF',
      discountAmount: 500,
      discountType: 'FLAT',
      message: '₹500 festive discount applied successfully!'
    };
  }

  if (cleanCode === 'FREESHIP') {
    return {
      valid: true,
      code: 'FREESHIP',
      title: 'Free Shipping Voucher',
      discountDisplay: 'FREE DELIVERY',
      discountAmount: 0,
      discountType: 'FREE_SHIPPING',
      message: 'Free shipping coupon applied! Delivery charge waived.'
    };
  }

  return {
    valid: false,
    message: `Invalid or expired coupon code "${cleanCode}". Please verify your code and retry.`
  };
}
