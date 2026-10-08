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

const API_BASE = 'http://localhost:8085/api';

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

  const dpPrice = product.dpPrice !== undefined && product.dpPrice !== null && product.dpPrice !== ''
    ? Number(product.dpPrice)
    : (product.distributorPrice !== undefined && product.distributorPrice !== null ? Number(product.distributorPrice) : null);

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
    Object.values(CATEGORY_CONFIGS).forEach(cfg => {
      if (cfg) {
        if (Array.isArray(cfg.allProducts)) updateArrayInPlace(cfg.allProducts, merged);
        if (Array.isArray(cfg.bestProducts)) updateArrayInPlace(cfg.bestProducts, merged);
      }
    });
  }

  notifyListeners(merged);
  return merged;
}

/**
 * Fetch all active products from Spring Boot backend MySQL database
 */
export async function syncCatalogFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) return null;
    const products = await res.json();
    if (Array.isArray(products) && products.length > 0) {
      products.forEach(p => mergeProductIntoCatalog(p));
      return products;
    }
  } catch (err) {
    // Backend offline or quiet fallback to mockData
    console.debug('Backend product sync quiet note:', err?.message || err);
  }
  return null;
}

// 4. Cross-Port Broadcast Channel for instant notification
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const channel = new BroadcastChannel('atomy_product_channel');
    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'PRODUCT_UPDATED' && data.product) {
        mergeProductIntoCatalog(data.product);
      }
    };
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
