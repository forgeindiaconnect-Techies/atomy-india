import {
  ALL_CATALOG_PRODUCTS,
  BEST_PRODUCTS,
  HAIR_BODY_PRODUCTS,
  FOOD_ESSENTIAL_PRODUCTS,
  HEALTH_ESSENTIAL_PRODUCTS,
  GSGS_PRODUCTS,
  ABSOLUTE_SKINCARE_PRODUCTS,
  CATEGORY_CONFIGS
} from '../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../data/officialDistributorPrices';

const rawApiBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india.onrender.com/api').trim().replace(/\/+$/, '');
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

const listeners = new Set();

/**
 * Register a listener to be notified when catalog products are updated from backend/admin
 */
export function onCatalogUpdate(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(updatedProduct) {
  listeners.forEach(cb => {
    try {
      cb(updatedProduct);
    } catch (e) {
      console.warn('Catalog listener error:', e);
    }
  });
}

function updateArrayInPlace(arr, updatedProduct) {
  if (!Array.isArray(arr) || !updatedProduct?.id) return;
  const idx = arr.findIndex(p => p && p.id === updatedProduct.id);
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...updatedProduct };
  }
}

const KNOWN_BEAUTY_IDS = new Set([
  'D00207', 'D00003', 'D00351', 'D00757', 'D01440', 'D04704', 'D01526', 'D00396', 'D00281', 'D00261',
  'D00301', 'D00271', 'D00321', 'D00756', 'D00466', 'D00266', 'D00267', 'D00331', 'D00311', 'D00198',
  'D04723', 'D00227', 'D00755', 'D00286', 'D04717', 'D00467', 'D00237', 'D00190', 'D00192', 'D01513',
  'D01523', 'D01235', 'D00465', 'D00196', 'D00217', 'D00257', 'D00482', 'D00247', 'D01443'
]);

const KNOWN_PERSONAL_CARE_IDS = new Set([
  'D00510', 'D00511', 'D00521', 'D00501', 'D90501', 'D00520', 'D00601', 'D00691', 'D00620', 'D00681',
  'D00631', 'D00629', 'D00487', 'D00488', 'D00692', 'D00541', 'D00693', 'D00400', 'D00661',
  'D00460', 'D00645', 'D00611'
]);

const KNOWN_HEALTH_IDS = new Set([
  'D90178', 'D04086', 'D94085', 'D04006', 'D00174', 'D00160', 'D00111', 'D94084', 'D00170'
]);

const KNOWN_HEMOHIM_IDS = new Set([
  'D00101', 'D00102', 'D00104'
]);

const KNOWN_FOOD_IDS = new Set([
  'D00975', 'D00183', 'D00180'
]);

const KNOWN_HOME_IDS = new Set([
  'D00835', 'D00828', 'D01883'
]);

const KNOWN_ETC_IDS = new Set([
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
 * Merge a single product into all live in-memory catalog structures
 */
export function mergeProductIntoCatalog(product) {
  if (!product || !product.id) return;

  const price = Number(product.price) || 0;
  let originalPrice = Number(product.originalPrice) || 0;
  let discountPercent = product.discountPercent !== undefined && product.discountPercent !== null && product.discountPercent !== ''
    ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
    : (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const hasOffer = discountPercent > 0 && originalPrice > price;
  if (!hasOffer) {
    discountPercent = 0;
    if (!originalPrice || originalPrice < price) {
      originalPrice = price;
    }
  }

  const official = product.id ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
  const dpPrice = product.dpPrice !== undefined && product.dpPrice !== null && product.dpPrice !== ''
    ? Number(product.dpPrice)
    : (product.distributorPrice !== undefined && product.distributorPrice !== null
      ? Number(product.distributorPrice)
      : (official?.dpPrice ?? null));

  const normalizedTags = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string'
      ? product.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  const formattedPrice = `₹ ${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedOriginalPrice = `₹ ${originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const merged = {
    ...product,
    price,
    originalPrice,
    discountPercent: hasOffer ? `${discountPercent}%` : null,
    rawDiscountPercent: discountPercent,
    hasOffer,
    dpPrice,
    tags: normalizedTags,
    formattedPrice,
    formattedOriginalPrice
  };

  // 1. Update in ALL_CATALOG_PRODUCTS
  if (Array.isArray(ALL_CATALOG_PRODUCTS)) {
    const idx = ALL_CATALOG_PRODUCTS.findIndex(p => p && p.id === product.id);
    if (idx >= 0) {
      ALL_CATALOG_PRODUCTS[idx] = { ...ALL_CATALOG_PRODUCTS[idx], ...merged };
    } else {
      ALL_CATALOG_PRODUCTS.unshift(merged);
    }
  }

  // 2. Update in all home sections and lists
  updateArrayInPlace(BEST_PRODUCTS, merged);
  updateArrayInPlace(HAIR_BODY_PRODUCTS, merged);
  updateArrayInPlace(FOOD_ESSENTIAL_PRODUCTS, merged);
  updateArrayInPlace(HEALTH_ESSENTIAL_PRODUCTS, merged);
  updateArrayInPlace(GSGS_PRODUCTS, merged);
  updateArrayInPlace(ABSOLUTE_SKINCARE_PRODUCTS, merged);

  // 3. Update across CATEGORY_CONFIGS
  if (CATEGORY_CONFIGS && typeof CATEGORY_CONFIGS === 'object') {
    const targetCatKey = resolveTargetCategoryKey(product);
    merged.categoryId = targetCatKey;

    const seenConfigs = new Set();
    Object.entries(CATEGORY_CONFIGS).forEach(([catKey, cfg]) => {
      if (!cfg || seenConfigs.has(cfg)) return;
      seenConfigs.add(cfg);

      const isTarget = catKey === targetCatKey ||
        ((catKey === 'others' || catKey === 'etc') && (targetCatKey === 'others' || targetCatKey === 'etc'));

      if (isTarget) {
        if (Array.isArray(cfg.allProducts)) {
          const idx = cfg.allProducts.findIndex(p => p && String(p.id) === String(product.id));
          if (idx >= 0) {
            cfg.allProducts[idx] = { ...cfg.allProducts[idx], ...merged };
          } else {
            cfg.allProducts.push(merged);
          }
        }
        if (Array.isArray(cfg.bestProducts)) {
          updateArrayInPlace(cfg.bestProducts, merged);
        }
      } else {
        // If product does not belong to this category, ensure it is completely removed
        if (Array.isArray(cfg.allProducts)) {
          const idx = cfg.allProducts.findIndex(p => p && String(p.id) === String(product.id));
          if (idx >= 0) cfg.allProducts.splice(idx, 1);
        }
        if (Array.isArray(cfg.bestProducts)) {
          const bIdx = cfg.bestProducts.findIndex(p => p && String(p.id) === String(product.id));
          if (bIdx >= 0) cfg.bestProducts.splice(bIdx, 1);
        }
      }
    });
  }

  notifyListeners(merged);
  return merged;
}

/**
 * Remove a single product from all live in-memory catalog structures
 */
export function removeProductFromCatalog(productId) {
  if (!productId) return;
  const idStr = String(productId);

  // 1. Remove from ALL_CATALOG_PRODUCTS
  if (Array.isArray(ALL_CATALOG_PRODUCTS)) {
    const idx = ALL_CATALOG_PRODUCTS.findIndex(p => p && String(p.id) === idStr);
    if (idx >= 0) ALL_CATALOG_PRODUCTS.splice(idx, 1);
  }

  const removeFromArray = (arr) => {
    if (!Array.isArray(arr)) return;
    const idx = arr.findIndex(p => p && String(p.id) === idStr);
    if (idx >= 0) arr.splice(idx, 1);
  };

  removeFromArray(BEST_PRODUCTS);
  removeFromArray(HAIR_BODY_PRODUCTS);
  removeFromArray(FOOD_ESSENTIAL_PRODUCTS);
  removeFromArray(HEALTH_ESSENTIAL_PRODUCTS);
  removeFromArray(GSGS_PRODUCTS);
  removeFromArray(ABSOLUTE_SKINCARE_PRODUCTS);

  if (CATEGORY_CONFIGS && typeof CATEGORY_CONFIGS === 'object') {
    const seenConfigs = new Set();
    Object.values(CATEGORY_CONFIGS).forEach(cfg => {
      if (cfg && !seenConfigs.has(cfg)) {
        seenConfigs.add(cfg);
        removeFromArray(cfg.allProducts);
        removeFromArray(cfg.bestProducts);
      }
    });
  }

  notifyListeners({ type: 'DELETE', id: idStr });
}

/**
 * Fetch all active products from Spring Boot backend MySQL database
 */
export async function syncCatalogFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) return null;
    const products = await res.json();
    if (Array.isArray(products)) {
      const activeIds = new Set(products.map(p => String(p.id)));

      // Merge active products
      products.forEach(p => mergeProductIntoCatalog(p));

      // Remove any previously stored product that was deleted from MySQL
      if (Array.isArray(ALL_CATALOG_PRODUCTS)) {
        const toRemove = ALL_CATALOG_PRODUCTS.filter(p => p && p.id && !activeIds.has(String(p.id)));
        toRemove.forEach(p => removeProductFromCatalog(p.id));
      }

      return products;
    }
  } catch (err) {
    console.debug('Backend product sync quiet note:', err?.message || err);
  }
  return null;
}

// 4. Cross-Port Broadcast Channel for instant notification
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const handleBroadcastMsg = (event) => {
      const data = event.data;
      if (!data) return;
      if ((data.type === 'PRODUCT_UPDATED' || data.type === 'PRODUCT_SAVED') && data.product) {
        mergeProductIntoCatalog(data.product);
      } else if (data.type === 'PRODUCT_DELETED' && data.productId) {
        removeProductFromCatalog(data.productId);
      }
    };

    const prodChannel = new BroadcastChannel('atomy_product_channel');
    prodChannel.onmessage = handleBroadcastMsg;

    const syncChannel = new BroadcastChannel('atomy_sync_channel');
    syncChannel.onmessage = handleBroadcastMsg;
  } catch (e) {
    console.warn('BroadcastChannel initialization note:', e);
  }
}

// 5. Automatic Active Sync: Immediate fetch, 2-second polling, and window focus/visibility triggers
if (typeof window !== 'undefined') {
  // Initial sync immediately
  syncCatalogFromBackend();

  // Active real-time polling every 2.5 seconds to sync admin changes across different localhost ports
  setInterval(() => {
    syncCatalogFromBackend();
  }, 2500);

  // Sync immediately when customer switches to this tab or window
  window.addEventListener('focus', () => {
    syncCatalogFromBackend();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncCatalogFromBackend();
    }
  });
}
