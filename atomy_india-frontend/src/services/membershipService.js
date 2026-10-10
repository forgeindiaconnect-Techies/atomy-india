// Membership Service for Atomy India
// Manages single-class Atomy Distributor Membership, Monthly & Annual plans, DP / PV pricing logic
// Synced with Spring Boot MySQL backend on port 8085

const rawBackendUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api').trim().replace(/\/+$/, '').replace(/atomy_india\.onrender\.com/i, 'atomy-india.onrender.com');
const BACKEND_URL = rawBackendUrl.endsWith('/api') ? rawBackendUrl : `${rawBackendUrl}/api`;
const API_BASE = `${BACKEND_URL}/membership`;
const ADMIN_API_BASE = `${BACKEND_URL}/admin/membership`;

const SETTINGS_KEY = 'atomy_membership_settings';
const MEMBERS_KEY = 'atomy_members_registry';

export const DEFAULT_MEMBERSHIP_SETTINGS = {
  className: 'Atomy Distributor Membership',
  code: 'DISTRIBUTOR_MEMBER',
  monthlyFee: 299,
  annualFee: 2499,
  annualDiscountLabel: 'Save 30%',
  wholesaleDiscountPercent: 18, // Wholesale DP is approx ~18% lower than retail MRP
  pvMultiplier: 1.0,
  active: true,
  description: 'Unlocks wholesale Distributor Price (DP) and earns Personal PV on every purchase.'
};

export const INITIAL_MEMBERS_REGISTRY = [];

export function getMembershipSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERSHIP_SETTINGS;
  } catch {
    return DEFAULT_MEMBERSHIP_SETTINGS;
  }
}

export async function fetchMembershipSettingsFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: data }));
      return data;
    }
  } catch (e) {
    console.warn('Backend membership settings sync fallback to cache:', e);
  }
  return getMembershipSettings();
}

export function saveMembershipSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: settings }));
    // Push to backend
    fetch(`${ADMIN_API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.warn('Backend save settings error:', err));
  } catch (e) {
    console.error('Failed to save membership settings', e);
  }
}

export function getMembersRegistry() {
  try {
    const saved = localStorage.getItem(MEMBERS_KEY);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Filter out any legacy hardcoded demo IDs or demo customers
      const clean = parsed.filter(m => 
        !['ATM-MEM-001', 'ATM-MEM-002', 'ATM-MEM-003', 'ATM-MEM-414'].includes(m.id) && 
        !m.paymentId?.includes('test') &&
        !['Naveen Test Customer', 'Test Shopper'].includes(m.customerName) &&
        !m.email?.includes('example.com') &&
        !m.customerEmail?.includes('example.com')
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchMembersRegistryFromBackend() {
  try {
    const res = await fetch(`${ADMIN_API_BASE}/members`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        const clean = list.filter(m => 
          !['ATM-MEM-001', 'ATM-MEM-002', 'ATM-MEM-003', 'ATM-MEM-414'].includes(m.id) && 
          !m.paymentId?.includes('test') &&
          !m.email?.includes('example.com') &&
          !m.customerEmail?.includes('example.com')
        );
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(clean));
        window.dispatchEvent(new CustomEvent('atomy:members-registry-updated', { detail: clean }));
        return clean;
      }
    }
  } catch (e) {
    console.warn('Backend members fetch fallback to cache:', e);
  }
  return getMembersRegistry();
}

export function saveMembersRegistry(list) {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('atomy:members-registry-updated', { detail: list }));
  } catch (e) {
    console.error('Failed to save members registry', e);
  }
}

export function cancelMembership(user) {
  if (!user) return user;
  const updatedUser = {
    ...user,
    isMember: false,
    membership: {
      ...(user.membership || {}),
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString()
    }
  };
  try {
    localStorage.setItem('atomy_current_user', JSON.stringify(updatedUser));
    const reg = getMembersRegistry().filter(m => 
      m.customerEmail !== user.email &&
      m.email !== user.email &&
      m.customerName !== user.name
    );
    saveMembersRegistry(reg);
  } catch (e) {
    console.error('Failed to cancel membership', e);
  }
  window.dispatchEvent(new CustomEvent('atomy:members-registry-updated'));
  window.dispatchEvent(new CustomEvent('atomy:membership-cancelled', { detail: updatedUser }));
  return updatedUser;
}

/**
 * Check if the given user currently has active membership.
 * RULE: Unauthenticated visitors (null/guest) ALWAYS return false.
 */
export function isUserMember(currentUser) {
  if (!currentUser) return false;

  // 1. Explicit membership flag from database / session
  if (currentUser.isMember === true) {
    return true;
  }

  // 2. Active membership sub-object on user
  if (currentUser.membership && (currentUser.membership.status === 'ACTIVE' || currentUser.membership.active === true)) {
    return true;
  }

  // 3. Check registry for active membership by email
  try {
    const reg = getMembersRegistry();
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    if (userEmail && reg.some(m => (m.customerEmail || m.email || '').toLowerCase().trim() === userEmail && (m.status === 'ACTIVE' || !m.status))) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Verify active membership status with MySQL backend database
 */
export async function verifyUserMembershipWithBackend(email) {
  if (!email) return false;
  try {
    const res = await fetch(`${API_BASE}/status?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.isMember);
    }
  } catch (e) {
    console.warn('Backend membership verification failed:', e);
  }
  return false;
}

/**
 * Calculate pricing for a product based on membership status.
 */
export function calculateProductPricing(product, isMember) {
  if (!product) {
    return {
      mrp: 0,
      offerPrice: 0,
      dpPrice: 0,
      activePrice: 0,
      pv: 0,
      isMember: false,
      showPv: true,
      hasOffer: false,
      discountPercent: 0
    };
  }

  const rawPrice = Number(product.price) || 0;
  const mrp = Number(product.originalPrice) || Math.round(rawPrice * 1.15);
  const offerPrice = rawPrice;

  // Explicit DP price or calculated ~18% lower wholesale distributor price
  const dpPrice = Number(product.dpPrice || product.distributorPrice) || Math.round(rawPrice * 0.82);
  const pv = Number(product.pv) || Math.round(rawPrice * 4.5);

  const activePrice = isMember ? dpPrice : offerPrice;
  const showPv = true;

  const hasOffer = mrp > activePrice;
  const discountPercent = hasOffer ? Math.round(((mrp - activePrice) / mrp) * 100) : 0;

  return {
    mrp,
    offerPrice,
    dpPrice,
    activePrice,
    pv,
    isMember,
    showPv,
    hasOffer,
    discountPercent,
    savings: Math.max(0, mrp - activePrice)
  };
}

/**
 * Enroll or subscribe current user into membership with payment details.
 * Stores in MySQL Database through Spring Boot on port 8085!
 */
export async function enrollMembership(user, plan = 'ANNUAL', paymentDetails = {}) {
  if (!user) return null;
  const registry = getMembersRegistry();
  const email = (user.email || `${user.username || 'user'}@atomy.in`).toLowerCase();
  const name = user.name || user.username || 'Atomy Customer';
  const phone = user.phone || '+91 98000 00000';

  const settings = getMembershipSettings();
  const amountPaid = plan === 'MONTHLY' ? settings.monthlyFee : settings.annualFee;
  const paymentMethod = paymentDetails.method || 'RAZORPAY_UPI';
  const paymentId = paymentDetails.id || `pay_atomy_${Date.now()}`;

  const payload = {
    name,
    email,
    phone,
    plan,
    amountPaid,
    paymentMethod,
    paymentId,
    paymentStatus: 'PAID'
  };

  let savedMember = null;

  try {
    // 1. Post to MySQL database via Spring Boot
    const res = await fetch(`${API_BASE}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      savedMember = await res.json();
    }
  } catch (err) {
    console.warn('Database membership save error, applying local fallback:', err);
  }

  // 2. Format member record for UI cache
  const now = new Date();
  const expiry = new Date();
  if (plan === 'ANNUAL') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  const memberRecord = savedMember || {
    id: `ATM-MEM-${Math.floor(100 + Math.random() * 900)}`,
    name,
    customerName: name,
    email,
    customerEmail: email,
    phone,
    customerPhone: phone,
    plan,
    status: 'ACTIVE',
    amountPaid,
    paymentMethod,
    paymentId,
    paymentStatus: 'PAID',
    startDate: now.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    lifetimePv: 0,
    totalSavings: 0
  };

  const updatedRegistry = [memberRecord, ...registry.filter(m => (m.customerEmail || m.email || '').toLowerCase() !== email)];
  saveMembersRegistry(updatedRegistry);

  // Update current user session if applicable
  try {
    const sessionUser = JSON.parse(localStorage.getItem('atomy_current_user') || '{}');
    if (sessionUser && (sessionUser.email === email || sessionUser.username === user.username)) {
      sessionUser.isMember = true;
      sessionUser.membership = {
        active: true,
        status: 'ACTIVE',
        plan,
        expiryDate: memberRecord.expiryDate,
        id: memberRecord.id
      };
      localStorage.setItem('atomy_current_user', JSON.stringify(sessionUser));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('atomy:membership-activated', { detail: memberRecord }));
  return memberRecord;
}
