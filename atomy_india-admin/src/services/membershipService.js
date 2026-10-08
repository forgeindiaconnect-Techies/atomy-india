// Membership Service for Atomy India Admin Console
// Manages single-class Atomy Distributor Membership, Monthly & Annual plans, and Member Registry
// Synced with Spring Boot MySQL backend on port 8085

const ADMIN_API_BASE = 'http://localhost:8085/api/admin/membership';

const SETTINGS_KEY = 'atomy_membership_settings';
const MEMBERS_KEY = 'atomy_members_registry';

export const DEFAULT_MEMBERSHIP_SETTINGS = {
  className: 'Atomy Distributor Membership',
  code: 'DISTRIBUTOR_MEMBER',
  monthlyFee: 299,
  annualFee: 2499,
  annualDiscountLabel: 'Save 30%',
  wholesaleDiscountPercent: 18,
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
    const res = await fetch(`${ADMIN_API_BASE}/settings`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: data }));
      return data;
    }
  } catch (e) {
    console.warn('Backend membership settings fetch error:', e);
  }
  return getMembershipSettings();
}

export function saveMembershipSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: settings }));

    // Sync to MySQL Backend on port 8085
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
      // Filter out any legacy hardcoded demo IDs
      const clean = parsed.filter(m => 
        !['ATM-MEM-001', 'ATM-MEM-002', 'ATM-MEM-003', 'ATM-MEM-414'].includes(m.id) && 
        !m.paymentId?.includes('test') &&
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

export async function fetchMembersFromBackend() {
  try {
    const res = await fetch(`${ADMIN_API_BASE}/members`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        // Normalize fields
        const normalized = list
          .filter(m => 
            !['ATM-MEM-001', 'ATM-MEM-002', 'ATM-MEM-003', 'ATM-MEM-414'].includes(m.id) && 
            !m.paymentId?.includes('test') &&
            !m.email?.includes('example.com') &&
            !m.customerEmail?.includes('example.com')
          )
          .map(m => ({
            ...m,
            name: m.customerName || m.name,
            email: m.customerEmail || m.email,
            phone: m.customerPhone || m.phone,
            startDate: m.startDate ? (typeof m.startDate === 'string' ? m.startDate.split('T')[0] : m.startDate) : '',
            expiryDate: m.expiryDate ? (typeof m.expiryDate === 'string' ? m.expiryDate.split('T')[0] : m.expiryDate) : ''
          }));
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent('atomy:members-registry-updated', { detail: normalized }));
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Backend members fetch failed, fallback to local:', e);
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

export async function addMemberToRegistry(memberData) {
  const registry = getMembersRegistry();
  const now = new Date();
  const expiry = new Date();
  if (memberData.plan === 'ANNUAL') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  // 1. Post to MySQL Backend
  try {
    const res = await fetch(`${ADMIN_API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        plan: memberData.plan
      })
    });
    if (res.ok) {
      const saved = await res.json();
      const normalized = {
        ...saved,
        name: saved.customerName || saved.name,
        email: saved.customerEmail || saved.email,
        phone: saved.customerPhone || saved.phone,
        startDate: saved.startDate ? saved.startDate.split('T')[0] : now.toISOString().split('T')[0],
        expiryDate: saved.expiryDate ? saved.expiryDate.split('T')[0] : expiry.toISOString().split('T')[0]
      };
      const updated = [normalized, ...registry.filter(m => (m.email || m.customerEmail) !== normalized.email)];
      saveMembersRegistry(updated);
      return normalized;
    }
  } catch (e) {
    console.warn('Backend add member error:', e);
  }

  // Fallback
  const newMember = {
    id: `ATM-MEM-${Math.floor(100 + Math.random() * 900)}`,
    name: memberData.name,
    customerName: memberData.name,
    email: memberData.email,
    customerEmail: memberData.email,
    phone: memberData.phone || '+91 98000 00000',
    plan: memberData.plan || 'ANNUAL',
    status: 'ACTIVE',
    startDate: now.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    lifetimePv: 0,
    totalSavings: 0,
    amountPaid: memberData.plan === 'MONTHLY' ? 299 : 2499,
    paymentMethod: 'ADMIN_MANUAL',
    paymentId: `admin_enrolled_${Date.now()}`,
    paymentStatus: 'PAID'
  };

  const updated = [newMember, ...registry.filter(m => (m.email || m.customerEmail) !== newMember.email)];
  saveMembersRegistry(updated);
  return newMember;
}

export async function updateMemberStatus(memberId, newStatus) {
  const registry = getMembersRegistry();
  const updated = registry.map((m) => {
    if (m.id === memberId) {
      return { ...m, status: newStatus };
    }
    return m;
  });
  saveMembersRegistry(updated);

  // Sync to MySQL Backend
  try {
    await fetch(`${ADMIN_API_BASE}/members/${encodeURIComponent(memberId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {
    console.warn('Backend update member status error:', e);
  }

  return updated;
}
