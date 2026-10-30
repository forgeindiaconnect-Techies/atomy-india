// Membership Service for Atomy India Admin Console
// Manages single-class Atomy Distributor Membership, Monthly & Annual plans, and Member Registry
// Synced with Spring Boot Backend & MongoDB Atlas database

const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india.onrender.com/api').trim().replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const ADMIN_MEMBERSHIP_API = `${API_BASE}/admin/membership`;
const CLOUD_MEMBERSHIP_API = 'https://atomy-india.onrender.com/api/admin/membership';

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
  const candidateUrls = [...new Set([ADMIN_MEMBERSHIP_API, CLOUD_MEMBERSHIP_API])];

  for (const baseUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${baseUrl}/settings`, { 
        headers: { 'Accept': 'application/json' },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
          if (data && typeof data === 'object' && data.jsonContent) {
            data = JSON.parse(data.jsonContent);
          }
        } catch {
          data = DEFAULT_MEMBERSHIP_SETTINGS;
        }
        if (data && typeof data === 'object') {
          const merged = { ...DEFAULT_MEMBERSHIP_SETTINGS, ...data };
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: merged }));
          return merged;
        }
      }
    } catch (e) {
      // try next candidate
    }
  }
  return getMembershipSettings();
}

export async function saveMembershipSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('atomy:membership-settings-updated', { detail: settings }));

    const targetUrls = [...new Set([ADMIN_MEMBERSHIP_API, CLOUD_MEMBERSHIP_API])];
    await Promise.allSettled(
      targetUrls.map(baseUrl =>
        fetch(`${baseUrl}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
      )
    );
  } catch (e) {
    console.error('Failed to save membership settings', e);
  }
}

export function getMembersRegistry() {
  try {
    const saved = localStorage.getItem(MEMBERS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchMembersFromBackend() {
  const candidateUrls = [...new Set([ADMIN_MEMBERSHIP_API, CLOUD_MEMBERSHIP_API])];

  for (const baseUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${baseUrl}/members`, { 
        headers: { 'Accept': 'application/json' },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          // Normalize real database records
          const normalized = list.map(m => ({
            ...m,
            name: m.customerName || m.name,
            customerName: m.customerName || m.name,
            email: m.customerEmail || m.email,
            customerEmail: m.customerEmail || m.email,
            phone: m.customerPhone || m.phone,
            customerPhone: m.customerPhone || m.phone,
            startDate: m.startDate ? (typeof m.startDate === 'string' ? m.startDate.split('T')[0] : m.startDate) : '',
            expiryDate: m.expiryDate ? (typeof m.expiryDate === 'string' ? m.expiryDate.split('T')[0] : m.expiryDate) : ''
          }));
          localStorage.setItem(MEMBERS_KEY, JSON.stringify(normalized));
          window.dispatchEvent(new CustomEvent('atomy:members-registry-updated', { detail: normalized }));
          return normalized;
        }
      }
    } catch (e) {
      // try next URL
    }
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

  const targetUrls = [...new Set([ADMIN_MEMBERSHIP_API, CLOUD_MEMBERSHIP_API])];
  let savedResult = null;

  for (const baseUrl of targetUrls) {
    try {
      const res = await fetch(`${baseUrl}/members`, {
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
        savedResult = await res.json();
        break;
      }
    } catch (err) {}
  }

  if (savedResult) {
    const normalized = {
      ...savedResult,
      name: savedResult.customerName || savedResult.name,
      customerName: savedResult.customerName || savedResult.name,
      email: savedResult.customerEmail || savedResult.email,
      customerEmail: savedResult.customerEmail || savedResult.email,
      phone: savedResult.customerPhone || savedResult.phone,
      customerPhone: savedResult.customerPhone || savedResult.phone,
      startDate: savedResult.startDate ? String(savedResult.startDate).split('T')[0] : now.toISOString().split('T')[0],
      expiryDate: savedResult.expiryDate ? String(savedResult.expiryDate).split('T')[0] : expiry.toISOString().split('T')[0]
    };
    const updated = [normalized, ...registry.filter(m => (m.email || m.customerEmail) !== normalized.email)];
    saveMembersRegistry(updated);
    return normalized;
  }

  return null;
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

  const targetUrls = [...new Set([ADMIN_MEMBERSHIP_API, CLOUD_MEMBERSHIP_API])];
  await Promise.allSettled(
    targetUrls.map(baseUrl =>
      fetch(`${baseUrl}/members/${encodeURIComponent(memberId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    )
  );

  return updated;
}
