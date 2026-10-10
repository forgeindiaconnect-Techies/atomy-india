/**
 * adPromotionService.js
 * Manages the Floating Ad & Pop-up Modal promotion with real-time backend sync:
 * - Syncs across Admin (5174) and Customer Store (5173) via Spring Boot MySQL Backend (8085)
 * - Immediate local caching with localStorage
 * - Real-time polling & window focus synchronization
 * - Daily 'Do not show again today' suppression handling
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api').replace(/\/+$/, '');

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
      return { ...DEFAULT_AD_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Error reading ad config:', err);
  }
  return { ...DEFAULT_AD_CONFIG };
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

  // Push to MySQL backend (port 8085)
  try {
    await fetch(`${API_BASE}/promotions/floating_ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  } catch (backendErr) {
    console.warn('Backend sync warning (offline or restarting):', backendErr);
  }

  return config;
}

// Pull latest ad config from MySQL backend
export async function fetchRemoteAdConfig() {
  try {
    const res = await fetch(`${API_BASE}/promotions/floating_ad`);
    if (res.ok) {
      const rawText = await res.text();
      if (rawText && rawText.trim() !== '') {
        const parsed = JSON.parse(rawText);
        const currentLocal = getAdConfig();
        // If changed or newer, update local storage and notify listeners
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
  // 1. Initial fetch on page load
  fetchRemoteAdConfig();

  // 2. Fetch whenever window gains focus (user switches between admin and store tabs)
  window.addEventListener('focus', () => {
    fetchRemoteAdConfig();
  });

  // 3. Regular live heartbeat polling (every 3 seconds)
  setInterval(() => {
    fetchRemoteAdConfig();
  }, 3000);
}

export function isAdSuppressedForToday() {
  try {
    const savedDate = localStorage.getItem(STORAGE_KEY_SUPPRESSED_DATE);
    const today = new Date().toDateString();
    return savedDate === today;
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
