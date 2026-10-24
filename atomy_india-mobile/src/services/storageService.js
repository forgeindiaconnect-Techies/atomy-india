import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_SESSION: '@atomy_user_session',
  IS_MEMBER: '@atomy_is_member',
  MEMBERSHIP_DATA: '@atomy_mobile_membership_data',
  LOGGED_OUT: '@atomy_user_logged_out',
  CART: '@atomy_mobile_cart',
  FAVORITES: '@atomy_mobile_favorites',
  PLACED_ORDERS: '@atomy_mobile_placed_orders',
  RECENTLY_VIEWED: '@atomy_mobile_recently_viewed',
};

// In-memory synchronous cache for immediate access
const memoryCache = {
  userSession: null,
  isMember: false,
  membershipData: null,
  isLoggedOut: false,
  cart: [],
  favorites: [],
  placedOrders: [],
  recentlyViewed: [],
};

/**
 * Initialize storage on app startup: loads persisted data from AsyncStorage into memory cache.
 */
export async function initStorage() {
  try {
    const [
      savedUser,
      savedMember,
      savedMemData,
      savedLoggedOut,
      savedCart,
      savedFavorites,
      savedOrders,
      savedRecent,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.USER_SESSION),
      AsyncStorage.getItem(KEYS.IS_MEMBER),
      AsyncStorage.getItem(KEYS.MEMBERSHIP_DATA),
      AsyncStorage.getItem(KEYS.LOGGED_OUT),
      AsyncStorage.getItem(KEYS.CART),
      AsyncStorage.getItem(KEYS.FAVORITES),
      AsyncStorage.getItem(KEYS.PLACED_ORDERS),
      AsyncStorage.getItem(KEYS.RECENTLY_VIEWED),
    ]);

    memoryCache.isLoggedOut = savedLoggedOut === 'true';

    if (savedUser && !memoryCache.isLoggedOut) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name && parsed.name !== 'Guest User') {
          memoryCache.userSession = parsed;
        }
      } catch (e) {}
    }

    if (savedMember !== null && !memoryCache.isLoggedOut) {
      memoryCache.isMember = savedMember === 'true';
    } else if (memoryCache.userSession && typeof memoryCache.userSession.isMember === 'boolean') {
      memoryCache.isMember = memoryCache.userSession.isMember;
    }

    if (savedMemData && !memoryCache.isLoggedOut) {
      try {
        memoryCache.membershipData = JSON.parse(savedMemData);
      } catch (e) {}
    }

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) memoryCache.cart = parsed;
      } catch (e) {}
    }

    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) memoryCache.favorites = parsed;
      } catch (e) {}
    }

    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) memoryCache.placedOrders = parsed;
      } catch (e) {}
    }

    if (savedRecent) {
      try {
        const parsed = JSON.parse(savedRecent);
        if (Array.isArray(parsed)) memoryCache.recentlyViewed = parsed;
      } catch (e) {}
    }
  } catch (err) {
    console.warn('[StorageService] Error initializing persistent storage:', err);
  }

  return { ...memoryCache };
}

/**
 * Persist user session to AsyncStorage and in-memory cache
 */
export async function saveUserSession(user) {
  memoryCache.userSession = user;
  memoryCache.isLoggedOut = false;
  try {
    if (user && user.name && user.name !== 'Guest User') {
      await AsyncStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
      await AsyncStorage.removeItem(KEYS.LOGGED_OUT);
      if (typeof user.isMember === 'boolean') {
        memoryCache.isMember = user.isMember;
        await AsyncStorage.setItem(KEYS.IS_MEMBER, user.isMember ? 'true' : 'false');
      }
    } else {
      await AsyncStorage.removeItem(KEYS.USER_SESSION);
    }
  } catch (err) {
    console.warn('[StorageService] Failed to persist user session:', err);
  }
}

/**
 * Get current user session from memory cache or AsyncStorage
 */
export async function getUserSession() {
  if (memoryCache.userSession) {
    return memoryCache.userSession;
  }
  try {
    const isLoggedOut = await AsyncStorage.getItem(KEYS.LOGGED_OUT);
    if (isLoggedOut === 'true') return null;

    const saved = await AsyncStorage.getItem(KEYS.USER_SESSION);
    if (saved) {
      const parsed = JSON.parse(saved);
      memoryCache.userSession = parsed;
      return parsed;
    }
  } catch (err) {}
  return null;
}

/**
 * Clear user session upon explicit logout
 */
export async function clearUserSession() {
  memoryCache.userSession = null;
  memoryCache.isMember = false;
  memoryCache.membershipData = null;
  memoryCache.isLoggedOut = true;
  try {
    await AsyncStorage.removeItem(KEYS.USER_SESSION);
    await AsyncStorage.setItem(KEYS.LOGGED_OUT, 'true');
    await AsyncStorage.setItem(KEYS.IS_MEMBER, 'false');
    await AsyncStorage.removeItem(KEYS.MEMBERSHIP_DATA);
    await AsyncStorage.removeItem(KEYS.CART);
    await AsyncStorage.removeItem(KEYS.FAVORITES);
    await AsyncStorage.removeItem(KEYS.PLACED_ORDERS);
  } catch (err) {
    console.warn('[StorageService] Failed to clear user session:', err);
  }
}

/**
 * Save membership status
 */
export async function saveMembershipStatus(isMember) {
  memoryCache.isMember = Boolean(isMember);
  try {
    await AsyncStorage.setItem(KEYS.IS_MEMBER, isMember ? 'true' : 'false');
    if (memoryCache.userSession) {
      memoryCache.userSession.isMember = Boolean(isMember);
      await AsyncStorage.setItem(KEYS.USER_SESSION, JSON.stringify(memoryCache.userSession));
    }
  } catch (err) {
    console.warn('[StorageService] Failed to save membership status:', err);
  }
}

/**
 * Save full membership details (plan, expiryDate, startDate, etc.)
 */
export async function saveMembershipData(data) {
  memoryCache.membershipData = data;
  try {
    if (data) {
      await AsyncStorage.setItem(KEYS.MEMBERSHIP_DATA, JSON.stringify(data));
    } else {
      await AsyncStorage.removeItem(KEYS.MEMBERSHIP_DATA);
    }
  } catch (err) {
    console.warn('[StorageService] Failed to save membership data:', err);
  }
}

/**
 * Save recently viewed products list
 */
export async function saveRecentlyViewed(list) {
  memoryCache.recentlyViewed = list;
  try {
    await AsyncStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify(list));
  } catch (err) {}
}

/**
 * Save active cart
 */
export async function saveCart(cart) {
  memoryCache.cart = cart;
  try {
    await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart));
  } catch (err) {}
}

/**
 * Save favorites
 */
export async function saveFavorites(favorites) {
  memoryCache.favorites = favorites;
  try {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (err) {}
}

/**
 * Save placed orders
 */
export async function savePlacedOrders(orders) {
  memoryCache.placedOrders = orders;
  try {
    await AsyncStorage.setItem(KEYS.PLACED_ORDERS, JSON.stringify(orders));
  } catch (err) {}
}

export default {
  initStorage,
  saveUserSession,
  getUserSession,
  clearUserSession,
  saveMembershipStatus,
  saveRecentlyViewed,
  saveCart,
  saveFavorites,
  savePlacedOrders,
};
