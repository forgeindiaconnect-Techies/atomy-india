/**
 * adPromotionService.js (Admin Console)
 * Manages the Floating Ad & Pop-up Modal promotion with real-time backend sync:
 * - Syncs across Admin (5174) and Customer Store (5173) via Spring Boot MySQL Backend (8085)
 * - Immediate local caching with localStorage
 * - Real-time polling & window focus synchronization
 * - Daily 'Do not show again today' suppression handling
 */

export function getApiBase() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8085/api';
  }
  const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-lqsy.onrender.com/api').trim().replace(/\/+$/, '').replace(/atomy[-_]india(\.onrender\.com)/i, 'atomy-india-lqsy$1');
  return rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
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
    image: '/images/promotions/promo_kolkata_notice.jpg',
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
    image: '/images/promotions/promo_welcome_coupon.jpg',
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
    image: '/images/promotions/promo_500_joining.jpg',
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
    subtitle: 'Diamond pentagonal cut, to express easy and delicate eyebrows, with a soft touch',
    price: 700,
    pv: 4000,
    image: '/images/promotions/new_arrival_adelica.png',
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
  image: '/images/promotions/new_arrival_adelica.png',
  badge: 'NEW LAUNCH',
  isActive: true,
  ads: DEFAULT_POPUP_ADS,
  updatedAt: new Date().toISOString()
};

const STORAGE_KEY_AD_CONFIG = 'atomy_floating_ad_config';
const STORAGE_KEY_SUPPRESSED_DATE = 'atomy_ad_do_not_show_today';

// Synchronous getter for fast initial render
export function getAdConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AD_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      const combined = { ...DEFAULT_AD_CONFIG, ...parsed };
      if (!combined.ads || !Array.isArray(combined.ads) || combined.ads.length === 0) {
        combined.ads = DEFAULT_POPUP_ADS;
      }
      return combined;
    }
  } catch (err) {
    console.error('Error reading ad config:', err);
  }
  return { ...DEFAULT_AD_CONFIG, ads: DEFAULT_POPUP_ADS };
}

// Save ad config locally and push to MySQL backend
export async function saveAdConfig(updatedConfig) {
  const config = {
    ...getAdConfig(),
    ...updatedConfig,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_AD_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('atomy:ad-updated', { detail: config }));
  } catch (err) {
    console.error('Local save error:', err);
  }

  // Push to Spring Boot backend (port 8085)
  try {
    const apiBase = getApiBase();
    await fetch(`${apiBase}/promotions/floating_ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  } catch (backendErr) {
    console.warn('Backend sync warning (offline or restarting):', backendErr);
  }

  return config;
}

// Pull latest ad config from Spring Boot backend
export async function fetchRemoteAdConfig() {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/promotions/floating_ad`);
    if (res.ok) {
      const rawText = await res.text();
      if (rawText && rawText.trim() !== '') {
        const parsed = JSON.parse(rawText);
        const currentLocal = getAdConfig();
        if (JSON.stringify(parsed) !== JSON.stringify(currentLocal)) {
          localStorage.setItem(STORAGE_KEY_AD_CONFIG, JSON.stringify(parsed));
          window.dispatchEvent(new CustomEvent('atomy:ad-updated', { detail: parsed }));
          return parsed;
        }
      }
    }
  } catch (err) {
    // Backend offline or quiet
  }
  return getAdConfig();
}

// Background auto-sync listener
if (typeof window !== 'undefined') {
  fetchRemoteAdConfig();

  window.addEventListener('focus', () => {
    fetchRemoteAdConfig();
  });

  setInterval(() => {
    fetchRemoteAdConfig();
  }, 3000);
}

export function isAdSuppressedForToday() {
  try {
    const savedDate = localStorage.getItem(STORAGE_KEY_SUPPRESSED_DATE);
    if (!savedDate) return false;
    const today = new Date().toDateString();
    return savedDate === today || savedDate === 'true' || savedDate === '1';
  } catch {
    return false;
  }
}

export function setAdSuppressedForToday(suppress = true) {
  try {
    if (suppress) {
      localStorage.setItem(STORAGE_KEY_SUPPRESSED_DATE, new Date().toDateString());
    } else {
      localStorage.removeItem(STORAGE_KEY_SUPPRESSED_DATE);
    }
  } catch (err) {
    console.error('Error setting ad suppression:', err);
  }
}

export function clearAdSuppressionForLogin() {
  try {
    localStorage.removeItem(STORAGE_KEY_SUPPRESSED_DATE);
    window.dispatchEvent(new CustomEvent('atomy:ad-trigger-login'));
  } catch (err) {
    console.error('Error clearing ad suppression:', err);
  }
}
