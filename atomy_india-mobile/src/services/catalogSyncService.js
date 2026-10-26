import {
  ALL_PRODUCTS,
  CATEGORY_CONFIGS,
  BEST_PRODUCTS,
  HEALTH_ESSENTIAL_PRODUCTS,
  ABSOLUTE_SKINCARE_PRODUCTS,
  HAIR_BODY_PRODUCTS,
  FOOD_ESSENTIAL_PRODUCTS,
  GSGS_PRODUCTS,
} from '../data/mockData.js';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../data/officialDistributorPrices.js';
import { fetchLiveProducts } from './api.js';
import { getHighResImageUrl } from '../utils/imageUtils.js';

const listeners = new Set();

/**
 * Register a listener to be notified when catalog products are updated from backend database
 */
export function onCatalogUpdate(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(products) {
  listeners.forEach((cb) => {
    try {
      cb(products);
    } catch (e) {
      console.warn('Catalog listener error:', e);
    }
  });
}

function updateArrayInPlace(arr, updatedProduct) {
  if (!Array.isArray(arr) || !updatedProduct?.id) return;
  const idx = arr.findIndex((p) => p && String(p.id) === String(updatedProduct.id));
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...updatedProduct };
  }
}

export const KNOWN_BEAUTY_IDS = new Set([
  'D00207', 'D00003', 'D00351', 'D00757', 'D01440', 'D04704', 'D01526', 'D00396', 'D00281', 'D00261',
  'D00301', 'D00271', 'D00321', 'D00756', 'D00466', 'D00266', 'D00267', 'D00331', 'D00311', 'D00198',
  'D04723', 'D00227', 'D00755', 'D00286', 'D04717', 'D00467', 'D00237', 'D00190', 'D00192', 'D01513',
  'D01523', 'D01235', 'D00465', 'D00196', 'D00217', 'D00257', 'D00482', 'D00247', 'D01443'
]);

export const KNOWN_PERSONAL_CARE_IDS = new Set([
  'D00510', 'D00511', 'D00521', 'D00501', 'D90501', 'D00520', 'D00601', 'D00691', 'D00620', 'D00681',
  'D00631', 'D00629', 'D00487', 'D00488', 'D00692', 'D00541', 'D00693', 'D00400', 'D00661',
  'D00460', 'D00645', 'D00611'
]);

export const KNOWN_HEALTH_IDS = new Set([
  'D90178', 'D04086', 'D94085', 'D04006', 'D00174', 'D00160', 'D00111', 'D94084', 'D00170'
]);

export const KNOWN_HEMOHIM_IDS = new Set([
  'D00101', 'D00102', 'D00104'
]);

export const KNOWN_FOOD_IDS = new Set([
  'D00975', 'D00183', 'D00180', 'D00901', 'D00902'
]);

export const KNOWN_HOME_IDS = new Set([
  'D00835', 'D00828', 'D01883', 'D00821', 'D00825'
]);

export const KNOWN_ETC_IDS = new Set([
  'D00553', 'D92445', 'D07115', 'D07116', 'D92676',
  'D92658', 'D92677', 'D92688', 'D92680', 'D02479'
]);

export function resolveTargetCategoryKey(product) {
  if (!product) return 'others';
  const id = String(product.id || '').toUpperCase();
  const name = String(product.name || '').toLowerCase();

  // 1. Authoritative ID lookups
  if (KNOWN_ETC_IDS.has(id)) return 'others';
  if (KNOWN_BEAUTY_IDS.has(id)) return 'beauty';
  if (KNOWN_PERSONAL_CARE_IDS.has(id)) return 'personal_care';
  if (KNOWN_HEMOHIM_IDS.has(id)) return 'hemohim';
  if (KNOWN_HEALTH_IDS.has(id)) return 'health';
  if (KNOWN_FOOD_IDS.has(id)) return 'food';
  if (KNOWN_HOME_IDS.has(id)) return 'home';

  // 2. Keyword categorization
  if (name.includes('hemohim')) return 'hemohim';
  if (
    name.includes('skincare') || name.includes('snow') || name.includes('fame') ||
    name.includes('cream') || name.includes('serum') || name.includes('toner') ||
    name.includes('lotion') || name.includes('eyeliner') || name.includes('mascara') ||
    name.includes('concealer') || name.includes('air pact') || name.includes('sunscreen') ||
    name.includes('bb cream') || name.includes('ampoule') || name.includes('mask') ||
    name.includes('hydra') || name.includes('night mask') || name.includes('sun stick') ||
    name.includes('brow pencil')
  ) {
    return 'beauty';
  }

  if (
    name.includes('toothbrush') || name.includes('toothpaste') || name.includes('shampoo') ||
    name.includes('conditioner') || name.includes('body cleanser') || name.includes('soap') ||
    name.includes('hair tonic') || name.includes('body lotion') || name.includes('body scrub') ||
    name.includes('oral care') || name.includes('hair treatment') || name.includes('hair essential oil') ||
    name.includes('scalpcare') || name.includes('lip glow') || name.includes('lip treatment')
  ) {
    return 'personal_care';
  }

  if (
    name.includes('spirulina') || name.includes('omega') || name.includes('moringa') ||
    name.includes('shilajit') || name.includes('milk thistle') || name.includes('nutraceutical') ||
    name.includes('noni') || name.includes('health combo')
  ) {
    return 'health';
  }

  if (name.includes('coffee') || name.includes('tea') || name.includes('pomegranate') || name.includes('jelly') || name.includes('arabica')) {
    return 'food';
  }

  if (name.includes('detergent') || name.includes('scrubber')) {
    return 'home';
  }

  const rawCat = (product.categoryId || product.category || '').toLowerCase().replace(/[\s-]+/g, '_');
  return rawCat || 'others';
}

/**
 * Merge live database product into catalog with high-res images and strict category separation
 */
export function mergeProductIntoCatalog(product) {
  if (!product || !product.id) return null;

  const official = product.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
  const price = Number(product.price) || (official ? official.dpPrice : 0);

  // Explicit database discount percent (0 means NO promotional retail discount)
  const dbDiscount = product.discountPercent !== undefined && product.discountPercent !== null && product.discountPercent !== ''
    ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
    : 0;

  // Real MRP from database:
  let originalPrice = Number(product.originalPrice || product.mrp);
  if (!originalPrice || originalPrice <= price) {
    if (official && official.mrp && official.mrp > price) {
      originalPrice = official.mrp;
    } else {
      originalPrice = price;
    }
  }

  // Offer condition matching website: only active if dbDiscount > 0 and originalPrice > price
  const hasOffer = dbDiscount > 0 && originalPrice > price;

  const dpPrice = product.dpPrice !== undefined && product.dpPrice !== null && product.dpPrice !== ''
    ? Number(product.dpPrice)
    : (official?.dpPrice || Math.round(price * 0.85));

  const pv = Number(product.pv !== undefined ? product.pv : (official?.pv || 0));

  const tags = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string' && product.tags.trim()
    ? product.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const categoryTab = Array.isArray(product.categoryTab)
    ? product.categoryTab
    : typeof product.categoryTab === 'string' && product.categoryTab.trim()
    ? product.categoryTab.split(',').map((t) => t.trim()).filter(Boolean)
    : ['ALL'];

  const highResImg = getHighResImageUrl(product.image || product.img || '');

  const targetCatKey = resolveTargetCategoryKey(product);

  const normalized = {
    ...product,
    price,
    originalPrice,
    mrp: originalPrice,
    discountPercent: dbDiscount,
    rawDiscountPercent: dbDiscount,
    hasOffer,
    dpPrice,
    pv,
    tags,
    categoryTab,
    category: targetCatKey,
    categoryId: targetCatKey,
    image: highResImg,
    img: highResImg,
  };

  // 1. Update in ALL_PRODUCTS
  if (Array.isArray(ALL_PRODUCTS)) {
    const idx = ALL_PRODUCTS.findIndex((p) => p && String(p.id) === String(product.id));
    if (idx >= 0) {
      ALL_PRODUCTS[idx] = { ...ALL_PRODUCTS[idx], ...normalized };
    } else {
      ALL_PRODUCTS.unshift(normalized);
    }
  }

  // 2. Update across CATEGORY_CONFIGS with strict cleanup of foreign categories
  if (CATEGORY_CONFIGS && typeof CATEGORY_CONFIGS === 'object') {
    const seenConfigs = new Set();
    Object.entries(CATEGORY_CONFIGS).forEach(([catKey, cfg]) => {
      if (!cfg || seenConfigs.has(cfg)) return;
      seenConfigs.add(cfg);

      const isTarget = catKey === targetCatKey ||
        ((catKey === 'others' || catKey === 'etc') && (targetCatKey === 'others' || targetCatKey === 'etc'));

      if (isTarget) {
        if (Array.isArray(cfg.allProducts)) {
          const idx = cfg.allProducts.findIndex((p) => p && String(p.id) === String(product.id));
          if (idx >= 0) {
            cfg.allProducts[idx] = { ...cfg.allProducts[idx], ...normalized };
          } else {
            cfg.allProducts.unshift(normalized);
          }
        }
        if (Array.isArray(cfg.bestProducts)) {
          updateArrayInPlace(cfg.bestProducts, normalized);
        }
      } else {
        // Strictly remove from foreign categories to eliminate beauty in health or vice versa
        if (Array.isArray(cfg.allProducts)) {
          const idx = cfg.allProducts.findIndex((p) => p && String(p.id) === String(product.id));
          if (idx >= 0) cfg.allProducts.splice(idx, 1);
        }
        if (Array.isArray(cfg.bestProducts)) {
          const bIdx = cfg.bestProducts.findIndex((p) => p && String(p.id) === String(product.id));
          if (bIdx >= 0) cfg.bestProducts.splice(bIdx, 1);
        }
      }
    });
  }

  if (Array.isArray(BEST_PRODUCTS)) updateArrayInPlace(BEST_PRODUCTS, normalized);
  if (Array.isArray(HEALTH_ESSENTIAL_PRODUCTS)) {
    if (targetCatKey === 'health') updateArrayInPlace(HEALTH_ESSENTIAL_PRODUCTS, normalized);
    else {
      const idx = HEALTH_ESSENTIAL_PRODUCTS.findIndex((p) => p && String(p.id) === String(product.id));
      if (idx >= 0) HEALTH_ESSENTIAL_PRODUCTS.splice(idx, 1);
    }
  }
  if (Array.isArray(ABSOLUTE_SKINCARE_PRODUCTS)) {
    if (targetCatKey === 'beauty') updateArrayInPlace(ABSOLUTE_SKINCARE_PRODUCTS, normalized);
  }
  if (Array.isArray(HAIR_BODY_PRODUCTS)) {
    if (targetCatKey === 'personal_care') updateArrayInPlace(HAIR_BODY_PRODUCTS, normalized);
  }
  if (Array.isArray(FOOD_ESSENTIAL_PRODUCTS)) {
    if (targetCatKey === 'food') updateArrayInPlace(FOOD_ESSENTIAL_PRODUCTS, normalized);
  }
  if (Array.isArray(GSGS_PRODUCTS)) updateArrayInPlace(GSGS_PRODUCTS, normalized);

  return normalized;
}

/**
 * Fetch catalog products from database via Spring Boot API (port 8085)
 */
export async function syncCatalogFromBackend() {
  try {
    const products = await fetchLiveProducts();
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => mergeProductIntoCatalog(p));
      notifyListeners(products);
      return products;
    }
  } catch (err) {
    console.warn('[CatalogSync] Failed to sync catalog from backend:', err?.message || err);
  }
  return null;
}
