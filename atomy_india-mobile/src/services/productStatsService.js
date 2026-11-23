import storageService from './storageService';

/**
 * Service to manage persistent and synchronized social proof stats in mobile:
 * - Likes: strictly connected to adding/removing from customer's Favorite list
 * - Purchased: increments whenever product is purchased in orders
 * - Added to Cart: increments whenever customer adds product to cart
 */

const listeners = new Set();

export function subscribeToStatsUpdates(callback) {
  if (typeof callback === 'function') {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
  return () => {};
}

export function notifyStatsUpdated() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {}
  });
}

/**
 * Check if a product is in the user's wishlist / favorites
 */
export function isProductFavorited(productId, favoritesList = null) {
  if (!productId) return false;
  const cleanId = String(productId).toLowerCase().trim();
  const list = Array.isArray(favoritesList) ? favoritesList : (storageService?.getFavorites?.() || []);

  return list.some((f) => {
    const fId = String(typeof f === 'string' ? f : f?.id || f?.code || '').toLowerCase().trim();
    return fId && fId === cleanId;
  });
}

/**
 * Get live stats for a product considering base numbers and favorite state.
 */
export function getProductStats(product, isFavorited = undefined, favoritesList = null) {
  if (!product) {
    return { likes: 51, purchased: 1219, addedToCart: 2333 };
  }

  const pId = String(product.id || product.code || 'D00101');
  const favState = isFavorited === true || (isFavorited !== false && isProductFavorited(pId, favoritesList));

  // Parse baseline values
  const baseLikes = typeof product.likes === 'number'
    ? product.likes
    : parseInt(String(product.likes || '204').replace(/[^0-9]/g, ''), 10) || 204;

  const basePurchased = typeof product.purchased === 'number'
    ? product.purchased
    : parseInt(String(product.purchased || '1,219').replace(/[^0-9]/g, ''), 10) || 1219;

  const baseAddedToCart = typeof product.addedToCart === 'number'
    ? product.addedToCart
    : parseInt(String(product.addedToCart || '2,333').replace(/[^0-9]/g, ''), 10) || 2333;

  return {
    likes: baseLikes + (favState ? 1 : 0),
    purchased: basePurchased,
    addedToCart: baseAddedToCart,
  };
}
