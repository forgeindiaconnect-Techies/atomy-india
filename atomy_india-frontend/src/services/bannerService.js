import { HERO_SLIDES, CATEGORY_CONFIGS } from '../data/mockData';

export function getApiBase() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8085/api';
  }
  const rawApiBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india.onrender.com/api').trim().replace(/\/+$/, '');
  return rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;
}

const STORAGE_KEY_HERO_SLIDES = 'atomy_hero_slides';
const STORAGE_PREFIX_CAT_BANNERS = 'atomy_cat_banners_';

// 1. Landing Hero Slides Management
export function getHeroSlides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HERO_SLIDES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s, idx) => {
          const defaultSlide = HERO_SLIDES[idx] || HERO_SLIDES.find(h => h.id === s.id);
          return {
            ...defaultSlide,
            ...s,
            productId: s.productId || defaultSlide?.productId,
            viewTarget: s.viewTarget || defaultSlide?.viewTarget
          };
        });
      }
    }
  } catch (err) {
    console.error('Error reading hero slides:', err);
  }
  return [...HERO_SLIDES];
}

export async function saveHeroSlides(slides) {
  try {
    localStorage.setItem(STORAGE_KEY_HERO_SLIDES, JSON.stringify(slides));
    window.dispatchEvent(new CustomEvent('atomy:hero-slides-updated', { detail: slides }));
  } catch (err) {
    console.error('Error saving hero slides locally:', err);
  }

  // Push to Spring Boot backend
  try {
    const apiBase = getApiBase();
    await fetch(`${apiBase}/promotions/hero_slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slides)
    });
  } catch (err) {
    console.warn('Backend sync warning for hero slides:', err);
  }

  return slides;
}

// 2. Category Section Banners Management
export function getCategoryBanners(categoryId) {
  const catKey = (categoryId || 'health').toLowerCase().replace(/\s+/g, '_');
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX_CAT_BANNERS + catKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading category banners for ' + catKey, err);
  }

  const config = CATEGORY_CONFIGS[catKey] || CATEGORY_CONFIGS.health;
  if (config && config.banners && config.banners.length > 0) {
    return [...config.banners];
  }
  if (config && config.banner) {
    return [config.banner];
  }
  return [];
}

export async function saveCategoryBanners(categoryId, banners) {
  const catKey = (categoryId || 'health').toLowerCase().replace(/\s+/g, '_');
  try {
    localStorage.setItem(STORAGE_PREFIX_CAT_BANNERS + catKey, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('atomy:cat-banners-updated', {
      detail: { categoryId: catKey, banners }
    }));
  } catch (err) {
    console.error('Error saving category banners locally:', err);
  }

  // Push to Spring Boot backend
  try {
    const apiBase = getApiBase();
    await fetch(`${apiBase}/promotions/cat_banners_${catKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banners)
    });
  } catch (err) {
    console.warn(`Backend sync warning for category banner ${catKey}:`, err);
  }

  return banners;
}

// 3. Pull all latest promotions & banners from backend database
export async function syncPromotionsFromBackend() {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/promotions`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data || typeof data !== 'object') return;

    // Check Hero Slides from DB
    if (data.hero_slides) {
      try {
        const remoteHero = JSON.parse(data.hero_slides);
        if (Array.isArray(remoteHero) && remoteHero.length > 0) {
          localStorage.setItem(STORAGE_KEY_HERO_SLIDES, JSON.stringify(remoteHero));
          window.dispatchEvent(new CustomEvent('atomy:hero-slides-updated', { detail: remoteHero }));
        }
      } catch (e) {}
    }

    // Check Category Banners from DB
    Object.keys(data).forEach((key) => {
      if (key.startsWith('cat_banners_')) {
        const catKey = key.replace('cat_banners_', '');
        try {
          const remoteBanners = JSON.parse(data[key]);
          if (Array.isArray(remoteBanners) && remoteBanners.length > 0) {
            localStorage.setItem(STORAGE_PREFIX_CAT_BANNERS + catKey, JSON.stringify(remoteBanners));
            window.dispatchEvent(new CustomEvent('atomy:cat-banners-updated', {
              detail: { categoryId: catKey, banners: remoteBanners }
            }));
          }
        } catch (e) {}
      }
    });
  } catch (err) {
    // Backend offline or quiet
  }
}

// Background auto-sync listener
if (typeof window !== 'undefined') {
  syncPromotionsFromBackend();

  window.addEventListener('focus', () => {
    syncPromotionsFromBackend();
  });

  setInterval(() => {
    syncPromotionsFromBackend();
  }, 4000);
}
