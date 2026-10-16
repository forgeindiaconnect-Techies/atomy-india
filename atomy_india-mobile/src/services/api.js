import { Platform, NativeModules } from 'react-native';

// Standard Spring Boot API base URL on port 8085
// Dynamically resolves to host machine LAN IP (physical devices via Expo), 10.0.2.2 (Android Emulator), or localhost (Web)
const getApiBase = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8085/api';
  }

  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
      if (match && match !== 'localhost' && match !== '127.0.0.1') {
        return `http://${match}:8085/api`;
      }
    }
  } catch (e) {}

  if (Platform.OS === 'android') {
    // Priority: Host LAN IP reachable by physical Android devices over Wi-Fi, fallback to emulator 10.0.2.2
    return 'http://192.168.1.19:8085/api';
  }
  return 'http://localhost:8085/api';
};

export const API_BASE = getApiBase();

/**
 * Fetch all active products live from MySQL database (port 8085)
 */
export async function fetchLiveProducts(categoryId = null, search = null) {
  try {
    let url = `${API_BASE}/products`;
    const params = [];
    if (categoryId && categoryId !== 'all_products') {
      params.push(`categoryId=${encodeURIComponent(categoryId)}`);
    }
    if (search && search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p) => ({
          ...p,
          id: p.id,
          name: p.name,
          price: Number(p.price || 0),
          mrp: Number(p.originalPrice || p.mrp || p.price || 0),
          pv: Number(p.pv || 0),
          img: p.image || p.img || '',
          category: p.categoryId || p.category || 'all',
          badge: p.tags?.replace('#', '') || p.badge || '',
          isBest: p.isBest || ((p.likesCount || 0) > 50) || false,
          isNew: p.isNew || false,
          isRecommended: p.isRecommended || true,
        }));
      }
    }
  } catch (err) {
    console.warn('[API] Could not fetch live products from backend, using fallback:', err.message);
  }
  return null;
}

/**
 * Check customer membership status from live MySQL database
 */
export async function fetchMembershipStatusApi(email) {
  try {
    if (!email) return null;
    const res = await fetch(`${API_BASE}/membership/status?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API] Could not check membership status:', err.message);
  }
  return null;
}

/**
 * Create order and save directly to MySQL database
 * Instantly synchronized with Admin Dashboard on port 5174!
 */
export async function createOrderApi(orderPayload) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.orderId) {
      return { success: true, order: data };
    }
    return {
      success: false,
      error: data.error || data.message || 'Failed to place order on server',
    };
  } catch (err) {
    console.warn('[API] Error calling placeOrder endpoint:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch customer orders from MySQL database
 */
export async function fetchOrderHistoryApi(email, phone) {
  try {
    let url = `${API_BASE}/orders/history?`;
    if (email) url += `email=${encodeURIComponent(email)}`;
    else if (phone) url += `phone=${encodeURIComponent(phone)}`;
    else return [];

    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API] Could not fetch order history from backend:', err.message);
  }
  return [];
}

/**
 * Fetch real-time dispatch and logistics tracking
 */
export async function fetchTrackingApi(orderId) {
  try {
    const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(orderId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API] Could not fetch tracking details:', err.message);
  }
  return null;
}

/**
 * Join Membership directly in MySQL database
 * Synced with Admin Membership management
 */
export async function joinMembershipApi(memberPayload) {
  try {
    const res = await fetch(`${API_BASE}/membership/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberPayload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, member: data };
    }
    return { success: false, error: data.error || 'Failed to join membership' };
  } catch (err) {
    console.warn('[API] Error joining membership:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Customer Registration in MySQL database
 */
export async function registerCustomerApi(customerData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Customer Login
 */
export async function loginCustomerApi(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Customer Google Sign-in / Fast Auth
 */
export async function googleAuthCustomerApi(googleData) {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const DEFAULT_POPUP_ADS = [
  {
    id: 'ad-kolkata-festive',
    name: 'Delivery Delayed in Kolkata – Festive Season',
    title: 'Delivery Delayed in Kolkata – Festive Season',
    brand: 'ATOMY NOTICE',
    collection: 'FESTIVE SEASON ADVISORY',
    tagline: 'Due to festive goods vehicle restrictions from 10–20 October 2026, deliveries may be affected in Kolkata, Howrah, Hooghly.',
    subtitle: 'Due to festive goods vehicle restrictions from 10–20 October 2026, deliveries may be affected in Kolkata, Howrah, Hooghly.',
    badge: 'NOTICE',
    badgeColor: '#EF4444',
    image: 'promo_kolkata_notice',
    link: '/notice',
    actionText: 'View Delivery Notice',
    price: 0,
    pv: 0,
    isActive: true,
  },
  {
    id: 'ad-welcome-coupon',
    name: 'Last Month For This Promo! ₹250 Coupon',
    title: 'Last Month For This Promo! ₹250 Coupon',
    brand: 'ATOMY SHOPPING MALL',
    collection: 'WELCOME EXCLUSIVE OFFER',
    tagline: 'Exclusive welcome offer for newly registered members. ₹250 coupon valid on purchases of ₹500 or more till 31st October 2026.',
    subtitle: 'Exclusive welcome offer for newly registered members on purchases of ₹500 or more.',
    badge: 'SPECIAL OFFER',
    badgeColor: '#F59E0B',
    image: 'promo_welcome_coupon',
    link: '/coupons',
    actionText: 'Claim ₹250 Coupon',
    price: 0,
    pv: 0,
    isActive: true,
  },
  {
    id: 'ad-500-joining',
    name: '500 New Joining Atomy Distributor Opportunity',
    title: '500 New Joining Atomy Distributor Opportunity',
    brand: 'ATOMY REWARDS',
    collection: 'FINAL MONTH BIG OPPORTUNITY',
    tagline: 'Complete 500 New Member Registrations between 1st - 31st October 2026 to unlock HemoHIM, Absolute & Evening Care sets!',
    subtitle: 'Complete 500 New Member Registrations to unlock HemoHIM & Absolute Skincare rewards!',
    badge: 'REWARDS',
    badgeColor: '#10B981',
    image: 'promo_500_joining',
    link: '/membership',
    actionText: 'Join Distributor Rewards',
    price: 0,
    pv: 0,
    isActive: true,
  },
  {
    id: 'D00620',
    name: 'Adelica Soft Brow Pencil - Gray',
    title: 'Adelica Soft Brow Pencil - Gray',
    brand: 'ATOMY adelica',
    collection: 'NEW ARRIVAL BEAUTY COLLECTION',
    tagline: 'Diamond pentagonal cut, to express easy and delicate eyebrows, with a soft touch',
    price: 700,
    pv: 4000,
    image: 'new_arrival_adelica',
    badge: 'NEW LAUNCH',
    badgeColor: '#00A3E0',
    link: '/product/D00620',
    actionText: 'Order Now (₹700)',
    isActive: true,
  }
];

export const DEFAULT_AD_CONFIG = {
  id: 'D00620',
  name: 'Adelica Soft Brow Pencil - Gray',
  brand: 'ATOMY adelica',
  collection: 'NEW ARRIVAL BEAUTY COLLECTION',
  tagline: 'Diamond pentagonal cut, to express easy and delicate eyebrows, with a soft touch',
  price: 700,
  pv: 4000,
  image: null, // will use bundled local image
  badge: 'NEW LAUNCH',
  isActive: true,
  ads: DEFAULT_POPUP_ADS,
};

/**
 * Fetch live Floating Ad configuration from MySQL / Spring Boot
 */
export async function fetchFloatingAdConfigApi() {
  try {
    const res = await fetch(`${API_BASE}/promotions/floating_ad`);
    if (res.ok) {
      const rawText = await res.text();
      if (rawText && rawText.trim() !== '') {
        const parsed = JSON.parse(rawText);
        return {
          ...DEFAULT_AD_CONFIG,
          ...parsed,
          ads: Array.isArray(parsed?.ads) && parsed.ads.length > 0 ? parsed.ads : DEFAULT_POPUP_ADS
        };
      }
    }
  } catch (err) {
    // quiet fallback to default ad config
  }
  return DEFAULT_AD_CONFIG;
}

