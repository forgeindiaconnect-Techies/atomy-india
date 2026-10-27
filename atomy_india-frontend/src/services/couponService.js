/**
 * couponService.js (Storefront)
 * Full CRUD synchronization with Spring Boot MongoDB Atlas Backend (port 8085)
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

export async function fetchCouponsFromBackend() {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/coupons`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // Format for storefront profile / checkout
        const customerFormat = data.map(c => ({
          id: c.id,
          code: c.code,
          discount: c.discountDisplay,
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
    console.warn('Backend fetch coupons warning:', err);
  }

  try {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export async function applyCouponBackend(code, cartAmount = 0, cartItems = [], isFirstOrder = true) {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartAmount, cartItems, isFirstOrder })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend apply coupon warning:', err);
  }
  return { valid: false, message: 'Could not connect to coupon verification server.' };
}
