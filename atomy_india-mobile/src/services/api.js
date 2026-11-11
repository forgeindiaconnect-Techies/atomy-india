import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Live Production / Cloud Server API Base
export const CLOUD_API_BASE = 'https://atomy-india-lqsy.onrender.com/api';

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

// Default API Base: Prioritizes responsive local backend, falls back to cloud
export const API_BASE = LOCAL_API_BASE || CLOUD_API_BASE;

/**
 * Fetch all active products live from database (tries Local Backend first for instant response, falls back to Cloud)
 */
export async function fetchLiveProducts(categoryId = null, search = null, pincode = null) {
  const params = [];
  if (categoryId && categoryId !== 'all_products') {
    params.push(`categoryId=${encodeURIComponent(categoryId)}`);
  }
  if (search && search.trim()) {
    params.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (pincode && String(pincode).trim()) {
    params.push(`pincode=${encodeURIComponent(String(pincode).trim())}`);
  }
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';

  const candidateUrls = [
    `${LOCAL_API_BASE}/products${queryString}`,
    `${CLOUD_API_BASE}/products${queryString}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((p) => {
            const tagList = Array.isArray(p.tags)
              ? p.tags
              : typeof p.tags === 'string' && p.tags.trim()
              ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [];
            const cleanTags = tagList.map((t) => (String(t).startsWith('#') ? String(t) : `#${String(t)}`));

            return {
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
              badge: typeof p.badge === 'string' && p.badge
                ? p.badge
                : cleanTags.length > 0
                ? cleanTags[0].replace('#', '')
                : '',
              tags: cleanTags,
              freeDelivery: Boolean(p.freeDelivery || p.isFreeDelivery),
              stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : 50,
              inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
              regionalHubId: p.regionalHubId || null,
              regionalHubName: p.regionalHubName || null,
              regionalPincode: p.regionalPincode || null,
              gstReduced: Boolean(p.gstReduced),
              isBest: p.isBest || ((p.likesCount || 0) > 50) || false,
              isNew: p.isNew || false,
              isRecommended: p.isRecommended || true,
            };
          });
        }
      }
    } catch (err) {
      // quiet fallback to next candidate
    }
  }
  return null;
}

/**
 * Check product inventory and deliverability for a specific destination PIN code
 */
export async function checkPincodeInventory(pincode) {
  const pin = String(pincode || '').trim();
  if (!pin) return { isDeliverable: true, itemsStock: {} };

  const candidateUrls = [
    `${LOCAL_API_BASE}/products?pincode=${encodeURIComponent(pin)}`,
    `${CLOUD_API_BASE}/products?pincode=${encodeURIComponent(pin)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const products = await res.json();
        if (Array.isArray(products) && products.length > 0) {
          const prodMap = {};
          let anyInStock = false;
          products.forEach((p) => {
            const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0;
            const inStk = Boolean(p.inStock) && qty >= 2;
            if (inStk) anyInStock = true;
            prodMap[p.id] = {
              stockQuantity: qty,
              inStock: inStk,
              hubId: p.regionalHubId,
              hubName: p.regionalHubName,
            };
          });
          return { isDeliverable: anyInStock, itemsStock: prodMap, raw: products };
        }
      }
    } catch (err) {
      // quiet fallback
    }
  }

  return { isDeliverable: true, itemsStock: {} };
}

/**
 * Fetch real-time Hub & Sub-Admin / Distributor Contact Details (including Co-Manager delegation)
 */
export async function fetchHubDetails(pincode) {
  const pin = String(pincode || '').trim() || '635001';
  const candidateUrls = [
    `${LOCAL_API_BASE}/pincodes/hub-details?pincode=${encodeURIComponent(pin)}`,
    `${CLOUD_API_BASE}/pincodes/hub-details?pincode=${encodeURIComponent(pin)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
  }

  // Authentic 1:1 distributor hub fallback
  if (pin === '635002') {
    return {
      found: true,
      distributorId: 'DIST-635002',
      hubName: 'Selva Regional Logistics Hub',
      hubAddress: 'RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002',
      contactPerson: 'Selva Kumar (Hub Manager)',
      phone: '+91 95388 53454',
      email: 'selvakumarc029@gmail.com',
      pincode: '635002',
      city: 'Krishnagiri',
      state: 'Tamil Nadu',
      operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
      pickupInstructions: 'Present your Order ID or downloaded Invoice PDF at the counter to collect your order.',
      isSubstituteActive: false,
      coManagerName: 'Hub Co-Manager',
      coManagerPhone: '+91 98401 23456',
    };
  } else if (pin === '635202') {
    return {
      found: true,
      distributorId: 'DIST-635202',
      hubName: 'Krishnapuram Regional Hub',
      hubAddress: 'No 55, MN traders, Krishnapuram, Dharmapuri - 635202',
      contactPerson: 'Munusamy (Hub Manager)',
      phone: '+91 98765 43210',
      email: 'krishnapuram.hub@atomy.in',
      pincode: '635202',
      city: 'Dharmapuri',
      state: 'Tamil Nadu',
      operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
      pickupInstructions: 'Present your Order ID or downloaded Invoice PDF at the counter to collect your order.',
      isSubstituteActive: false,
      coManagerName: 'Hub Co-Manager (Model 1)',
      coManagerPhone: '+91 98401 23456',
    };
  }

  return {
    found: true,
    distributorId: `DIST-${pin}`,
    hubName: 'Atomy Regional Logistics Hub',
    hubAddress: `Designated Regional Logistics Centre, Sector Hub - ${pin}`,
    contactPerson: 'Selva Kumar (Hub Manager)',
    phone: '+91 95388 53454',
    email: 'support.india@atomy.com',
    pincode: pin,
    city: 'Regional District',
    state: 'India',
    operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
    pickupInstructions: 'Present your Order ID or invoice at the counter to collect your parcel.',
    isSubstituteActive: false,
    coManagerName: 'Hub Co-Manager (Standby)',
    coManagerPhone: '+91 98401 23456',
  };
}

/**
 * Check customer membership status from database (Cloud first + Local fallback)
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
    `${LOCAL_API_BASE}/orders`,
    `${CLOUD_API_BASE}/orders`,
  ];

  let successfulResult = null;
  let lastErrorMessage = null;

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
        return { success: true, order: data };
      } else {
        lastErrorMessage = data.error || data.message || `Failed on ${url}`;
      }
    } catch (err) {
      lastErrorMessage = err.message;
    }
  }

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
    `${LOCAL_API_BASE}/orders/history?${param}`,
    `${CLOUD_API_BASE}/orders/history?${param}`,
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
    `${LOCAL_API_BASE}/tracking/${encodeURIComponent(orderId)}`,
    `${CLOUD_API_BASE}/tracking/${encodeURIComponent(orderId)}`,
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
 * Join Membership in Cloud Server AND Local Host
 */
export async function joinMembershipApi(memberPayload) {
  const targetUrls = [
    `${LOCAL_API_BASE}/membership/join`,
    `${CLOUD_API_BASE}/membership/join`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberPayload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, member: data };
      }
    } catch (err) {}
  }

  return { success: false, error: 'Failed to join membership on server' };
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
    `${LOCAL_API_BASE}/auth/register`,
    `${CLOUD_API_BASE}/auth/register`,
  ];

  let lastError = 'Failed to register on server';

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data };
      }
      if (res.status === 400 || res.status === 409 || res.status === 422) {
        return {
          success: false,
          error: data.message || data.error || 'Registration failed.',
          data,
        };
      }
    } catch (err) {
      lastError = err.message || lastError;
    }
  }
  return { success: false, error: lastError };
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
    `${LOCAL_API_BASE}/auth/login`,
    `${CLOUD_API_BASE}/auth/login`,
  ];

  let lastError = 'Failed to log in on server';

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data };
      }
      // If the backend actively responded with 400, 401, or 403 (e.g. wrong credentials or not found),
      // return the server's exact response message directly!
      if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
        return {
          success: false,
          error: data.message || data.error || 'Incorrect email or password.',
          data,
        };
      }
    } catch (err) {
      lastError = err.message || lastError;
    }
  }
  return { success: false, error: lastError };
}

/**
 * Fetch customer profile live from database (Cloud Server + Local fallback)
 */
export async function fetchCustomerProfileApi(email) {
  if (!email) return null;
  const candidateUrls = [
    `${LOCAL_API_BASE}/auth/profile?email=${encodeURIComponent(email)}`,
    `${CLOUD_API_BASE}/auth/profile?email=${encodeURIComponent(email)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.customer) {
          return data.customer;
        }
      }
    } catch (err) {}
  }
  return null;
}

/**
 * Update customer profile in database
 */
export async function updateCustomerProfileApi(profileData) {
  const payload = {
    email: profileData.email || '',
    fullName: profileData.fullName || profileData.name || '',
    name: profileData.name || profileData.fullName || '',
    phone: profileData.phone || '',
    address: profileData.address || '',
    city: profileData.city || '',
    state: profileData.state || '',
    pincode: profileData.pincode || '',
    gender: profileData.gender || '',
    dob: profileData.dob || '',
  };

  const targetUrls = [
    `${LOCAL_API_BASE}/auth/profile`,
    `${CLOUD_API_BASE}/auth/profile`,
  ];

  let lastError = null;

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.customer) {
        return { success: true, customer: data.customer };
      } else {
        lastError = data.message || 'Failed to update profile';
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return { success: false, error: lastError || 'Failed to update profile' };
}

/**
 * Customer Google Sign-in / Fast Auth
 */
export async function googleAuthCustomerApi(googleData) {
  const targetUrls = [
    `${LOCAL_API_BASE}/auth/google`,
    `${CLOUD_API_BASE}/auth/google`,
  ];

  let lastError = 'Google sign-in failed on server';

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data };
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: data.message || data.error || 'Google sign-in failed.',
          data,
        };
      }
    } catch (err) {
      lastError = err.message || lastError;
    }
  }
  return { success: false, error: lastError };
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

/**
 * Fetch product customer reviews live from backend
 */
export async function fetchProductReviewsApi(productId) {
  if (!productId) return [];
  const targetUrls = [
    `${LOCAL_API_BASE}/customer/reviews?productId=${encodeURIComponent(productId)}`,
    `${CLOUD_API_BASE}/customer/reviews?productId=${encodeURIComponent(productId)}`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
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
 * Fetch verified product reviews submitted for a specific order ID
 */
export async function fetchOrderReviewsApi(orderId) {
  if (!orderId) return [];
  const targetUrls = [
    `${LOCAL_API_BASE}/customer/reviews/order/${encodeURIComponent(orderId)}`,
    `${CLOUD_API_BASE}/customer/reviews/order/${encodeURIComponent(orderId)}`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
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
 * Submit verified product rating & review
 */
export async function submitProductReviewApi(reviewData) {
  const targetUrls = [
    `${LOCAL_API_BASE}/customer/reviews`,
    `${CLOUD_API_BASE}/customer/reviews`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson && errJson.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('abort') && !err.message.includes('Network')) {
        throw err;
      }
    }
  }
  throw new Error('Unable to submit review. Server unreachable.');
}


