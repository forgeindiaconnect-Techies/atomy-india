/**
 * Service to manage persistent and synchronized social proof stats:
 * - Likes: strictly connected to adding/removing from customer's Favorite list
 * - Purchased: increments whenever product is purchased in orders
 * - Added to Cart: increments whenever customer adds product to cart
 */

const STATS_STORAGE_KEY = 'atomy_dynamic_product_stats';

function getStoredStatsMap() {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredStatsMap(statsMap) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(statsMap));
    window.dispatchEvent(new CustomEvent('atomy:product-stats-updated'));
  } catch {}
}

/**
 * Get live stats for a product considering base numbers, favorites state, and recorded actions.
 */
export function getProductStats(product, isFavorited = false) {
  if (!product) {
    return { likes: 51, purchased: 1219, addedToCart: 2333 };
  }

  const pId = String(product.id || 'D00101');
  const statsMap = getStoredStatsMap();
  const prodStats = statsMap[pId] || { extraPurchased: 0, extraAddedToCart: 0 };

  // Parse baseline values
  const baseLikes = typeof product.likes === 'number'
    ? product.likes
    : parseInt(String(product.likes || '51').replace(/[^0-9]/g, ''), 10) || 51;

  const basePurchased = typeof product.purchased === 'number'
    ? product.purchased
    : parseInt(String(product.purchased || '1,219').replace(/[^0-9]/g, ''), 10) || 1219;

  const baseAddedToCart = typeof product.addedToCart === 'number'
    ? product.addedToCart
    : parseInt(String(product.addedToCart || '2,333').replace(/[^0-9]/g, ''), 10) || 2333;

  return {
    likes: baseLikes + (isFavorited ? 1 : 0),
    purchased: basePurchased + (prodStats.extraPurchased || 0),
    addedToCart: baseAddedToCart + (prodStats.extraAddedToCart || 0)
  };
}

/**
 * Record addition to cart (increments Added to cart counter)
 */
export function recordProductAddedToCart(productId, quantity = 1) {
  if (!productId) return;
  const pId = String(productId);
  const statsMap = getStoredStatsMap();
  const current = statsMap[pId] || { extraPurchased: 0, extraAddedToCart: 0 };
  const addCount = typeof quantity === 'number' && quantity > 0 ? quantity : 1;

  statsMap[pId] = {
    ...current,
    extraAddedToCart: (current.extraAddedToCart || 0) + addCount
  };

  saveStoredStatsMap(statsMap);
}

/**
 * Record purchase of product (increments Purchased counter)
 */
export function recordProductPurchased(productId, quantity = 1) {
  if (!productId) return;
  const pId = String(productId);
  const statsMap = getStoredStatsMap();
  const current = statsMap[pId] || { extraPurchased: 0, extraAddedToCart: 0 };
  const count = typeof quantity === 'number' && quantity > 0 ? quantity : 1;

  statsMap[pId] = {
    ...current,
    extraPurchased: (current.extraPurchased || 0) + count
  };

  saveStoredStatsMap(statsMap);
}
