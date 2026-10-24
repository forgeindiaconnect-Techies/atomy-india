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

/**
 * Merge live database product into catalog
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
    image: product.image || product.img || '',
    img: product.image || product.img || '',
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

  // 2. Update across CATEGORY_CONFIGS
  if (CATEGORY_CONFIGS && typeof CATEGORY_CONFIGS === 'object') {
    const rawCat = product.categoryId || product.category || 'health';
    const targetCatKey = String(rawCat).toLowerCase().replace(/[\s-]+/g, '_');
    Object.entries(CATEGORY_CONFIGS).forEach(([catKey, cfg]) => {
      if (cfg) {
        if (
          catKey === targetCatKey ||
          (targetCatKey === 'personal' && catKey === 'personal_care') ||
          (targetCatKey === 'health' && catKey === 'health')
        ) {
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
        }
      }
    });
  }

  if (Array.isArray(BEST_PRODUCTS)) updateArrayInPlace(BEST_PRODUCTS, normalized);
  if (Array.isArray(HEALTH_ESSENTIAL_PRODUCTS)) updateArrayInPlace(HEALTH_ESSENTIAL_PRODUCTS, normalized);
  if (Array.isArray(ABSOLUTE_SKINCARE_PRODUCTS)) updateArrayInPlace(ABSOLUTE_SKINCARE_PRODUCTS, normalized);
  if (Array.isArray(HAIR_BODY_PRODUCTS)) updateArrayInPlace(HAIR_BODY_PRODUCTS, normalized);
  if (Array.isArray(FOOD_ESSENTIAL_PRODUCTS)) updateArrayInPlace(FOOD_ESSENTIAL_PRODUCTS, normalized);
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
