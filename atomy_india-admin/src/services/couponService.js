/**
 * couponService.js (Admin Console)
 * Full CRUD synchronization with Spring Boot MongoDB Atlas Backend (port 8085)
 */

export function getApiBase() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8085/api';
  }
  const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india.onrender.com/api').trim().replace(/\/+$/, '');
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
        
        // Also sync customer format
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
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch coupons warning:', err);
  }

  // Fallback to local storage cache
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export async function saveCouponToBackend(coupon) {
  const apiBase = getApiBase();
  try {
    // Check if it already exists in backend by making PUT, otherwise POST
    const checkRes = await fetch(`${apiBase}/coupons/${encodeURIComponent(coupon.id)}`);
    const method = checkRes.ok ? 'PUT' : 'POST';
    const url = checkRes.ok ? `${apiBase}/coupons/${encodeURIComponent(coupon.id)}` : `${apiBase}/coupons`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend save coupon warning:', err);
  }
  return coupon;
}

export async function deleteCouponFromBackend(id) {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/coupons/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend delete coupon warning:', err);
  }
  return { success: false, id };
}

export async function applyCouponBackend(code, cartAmount = 0) {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartAmount })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend apply coupon warning:', err);
  }
  return { valid: false, message: 'Could not connect to coupon verification server.' };
}
