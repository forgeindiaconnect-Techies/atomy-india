import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Live Production / Cloud Server API Base
export const CLOUD_API_BASE = 'https://atomy-india.onrender.com/api';

// Dynamic Localhost / LAN Machine API Base (for local testing)
const getLocalApiBase = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8085/api';
  }

  try {
    const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:8085/api`;
      }
    }
  } catch (e) {}

  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
      if (match && match !== 'localhost' && match !== '127.0.0.1') {
        return `http://${match}:8085/api`;
      }
    }
  } catch (e) {}

  return 'http://192.168.1.27:8085/api';
};

export const LOCAL_API_BASE = getLocalApiBase();

// Default API Base prioritizes the active local backend (connected to MongoDB Atlas)
export const API_BASE = LOCAL_API_BASE;

/**
 * Fetch all active products live from database (tries Local Backend first for instant response, falls back to Cloud)
 */
export async function fetchLiveProducts(categoryId = null, search = null) {
  const params = [];
  if (categoryId && categoryId !== 'all_products') {
    params.push(`categoryId=${encodeURIComponent(categoryId)}`);
  }
  if (search && search.trim()) {
    params.push(`search=${encodeURIComponent(search.trim())}`);
  }
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';

  const candidateUrls = [
    `${LOCAL_API_BASE}/products${queryString}`,
    `${CLOUD_API_BASE}/products${queryString}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
            originalPrice: Number(p.originalPrice || p.mrp || p.price || 0),
            mrp: Number(p.originalPrice || p.mrp || p.price || 0),
            discountPercent: p.discountPercent !== undefined && p.discountPercent !== null ? Number(p.discountPercent) : 0,
            dpPrice: Number(p.dpPrice || 0),
            pv: Number(p.pv || 0),
            img: p.image || p.img || '',
            image: p.image || p.img || '',
            category: p.categoryId || p.category || 'all',
            badge: typeof p.tags === 'string'
              ? p.tags.replace('#', '')
              : Array.isArray(p.tags) && p.tags.length > 0
              ? String(p.tags[0]).replace('#', '')
              : p.badge || '',
            tags: Array.isArray(p.tags)
              ? p.tags
              : typeof p.tags === 'string' && p.tags.trim()
              ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
            gstReduced: Boolean(p.gstReduced),
            isBest: p.isBest || ((p.likesCount || 0) > 50) || false,
            isNew: p.isNew || false,
            isRecommended: p.isRecommended || true,
          }));
        }
      }
    } catch (err) {
      // quiet fallback to next candidate
    }
  }
  return null;
}

/**
 * Check customer membership status from database (Local Backend first + Cloud fallback)
 */
export async function fetchMembershipStatusApi(email) {
  if (!email) return null;
  const candidateUrls = [
    `${LOCAL_API_BASE}/membership/status?email=${encodeURIComponent(email)}`,
    `${CLOUD_API_BASE}/membership/status?email=${encodeURIComponent(email)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // quiet fallback
    }
  }
  return null;
}

/**
 * Create order and broadcast to BOTH Cloud Server and Local Host in parallel!
 * This guarantees the live server Admin and local Admin BOTH receive the order!
 */
export async function createOrderApi(orderPayload) {
  const targetUrls = [
    `${CLOUD_API_BASE}/orders`,
    `${LOCAL_API_BASE}/orders`,
  ];

  let successfulResult = null;
  let lastErrorMessage = null;

  await Promise.allSettled(
    targetUrls.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.orderId) {
          console.log(`[API] Order successfully received by: ${url} (Order ID: ${data.orderId})`);
          successfulResult = { success: true, order: data };
        } else {
          lastErrorMessage = data.error || data.message || `Failed on ${url}`;
        }
      } catch (err) {
        console.warn(`[API] Order dispatch to ${url} failed:`, err.message);
        lastErrorMessage = err.message;
      }
    })
  );

  if (successfulResult) {
    return successfulResult;
  }
  return { success: false, error: lastErrorMessage || 'Failed to place order on server' };
}

/**
 * Fetch customer orders from database (Cloud Server + Local fallback)
 */
export async function fetchOrderHistoryApi(email, phone) {
  let param = '';
  if (email) param = `email=${encodeURIComponent(email)}`;
  else if (phone) param = `phone=${encodeURIComponent(phone)}`;
  else return [];

  const candidateUrls = [
    `${CLOUD_API_BASE}/orders/history?${param}`,
    `${LOCAL_API_BASE}/orders/history?${param}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const orders = await res.json();
        if (Array.isArray(orders) && orders.length > 0) {
          return orders;
        }
      }
    } catch (err) {}
  }
  return [];
}

/**
 * Fetch real-time dispatch and logistics tracking
 */
export async function fetchTrackingApi(orderId) {
  const candidateUrls = [
    `${CLOUD_API_BASE}/tracking/${encodeURIComponent(orderId)}`,
    `${LOCAL_API_BASE}/tracking/${encodeURIComponent(orderId)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
  }
  return null;
}

/**
 * Join Membership in Cloud Server AND Local Host in parallel
 */
export async function joinMembershipApi(memberPayload) {
  const targetUrls = [
    `${CLOUD_API_BASE}/membership/join`,
    `${LOCAL_API_BASE}/membership/join`,
  ];

  let successfulResult = null;

  await Promise.allSettled(
    targetUrls.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberPayload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          successfulResult = { success: true, member: data };
        }
      } catch (err) {}
    })
  );

  return successfulResult || { success: false, error: 'Failed to join membership on server' };
}

/**
 * Customer Registration (Cloud Server + Local fallback)
 */
export async function registerCustomerApi(customerData) {
  const payload = {
    fullName: customerData.fullName || customerData.name || '',
    email: customerData.email || '',
    phone: customerData.phone || '',
    password: customerData.password || '',
    username: customerData.username || (customerData.email ? customerData.email.split('@')[0] : ''),
    address: customerData.address || '',
    source: customerData.source || 'MOBILE_SIGNUP',
  };

  const targetUrls = [
    `${CLOUD_API_BASE}/auth/register`,
    `${LOCAL_API_BASE}/auth/register`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data };
    } catch (err) {}
  }
  return { success: false, error: 'Failed to register on server' };
}

/**
 * Customer Login (Cloud Server + Local fallback)
 */
export async function loginCustomerApi(credentials) {
  const payload = {
    usernameOrEmail: credentials.usernameOrEmail || credentials.email || credentials.username || credentials.identifier || '',
    password: credentials.password || '',
  };

  const targetUrls = [
    `${CLOUD_API_BASE}/auth/login`,
    `${LOCAL_API_BASE}/auth/login`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data };
    } catch (err) {}
  }
  return { success: false, error: 'Failed to log in on server' };
}

/**
 * Customer Google Sign-in / Fast Auth
 */
export async function googleAuthCustomerApi(googleData) {
  const targetUrls = [
    `${CLOUD_API_BASE}/auth/google`,
    `${LOCAL_API_BASE}/auth/google`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data };
    } catch (err) {}
  }
  return { success: false, error: 'Google sign-in failed on server' };
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

// ---------------------------------------------------------------------------
// Brevo Transactional Email & Password Reset APIs
// ---------------------------------------------------------------------------

/**
 * Step 1: Request 6-digit OTP code to email via Brevo transactional email
 */
export async function requestForgotPasswordOtp(email) {
  const targetUrls = [
    `${LOCAL_API_BASE}/auth/forgot-password`,
    `${CLOUD_API_BASE}/auth/forgot-password`,
  ];

  let lastError = null;
  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data;
      lastError = data.message || 'Failed to send reset code';
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(lastError || 'Failed to connect to authentication server');
}

/**
 * Step 2: Verify the 6-digit OTP code entered by the user
 */
export async function verifyPasswordOtp(email, otp) {
  const targetUrls = [
    `${LOCAL_API_BASE}/auth/verify-otp`,
    `${CLOUD_API_BASE}/auth/verify-otp`,
  ];

  let lastError = null;
  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data;
      lastError = data.message || 'Invalid or expired verification code';
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(lastError || 'Failed to verify OTP code');
}

/**
 * Step 3: Set and securely save the new password
 */
export async function resetCustomerPassword(email, otp, newPassword) {
  const targetUrls = [
    `${LOCAL_API_BASE}/auth/reset-password`,
    `${CLOUD_API_BASE}/auth/reset-password`,
  ];

  let lastError = null;
  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data;
      lastError = data.message || 'Failed to reset password';
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(lastError || 'Failed to update new password');
}

// ---------------------------------------------------------------------------
// Dynamic Coupons APIs (MongoDB Atlas Backend)
// ---------------------------------------------------------------------------

/**
 * Fetch all active promotional coupons
 */
export async function fetchCouponsApi() {
  const targetUrls = [
    `${LOCAL_API_BASE}/coupons`,
    `${CLOUD_API_BASE}/coupons`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {}
  }
  return [];
}

/**
 * Validate and apply coupon to cart
 */
export async function applyCouponApi(code, cartAmount = 0, cartItems = [], isFirstOrder = true) {
  const targetUrls = [
    `${LOCAL_API_BASE}/coupons/apply`,
    `${CLOUD_API_BASE}/coupons/apply`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartAmount, cartItems, isFirstOrder }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
  }
  return { valid: false, message: 'Could not connect to coupon verification server.' };
}

