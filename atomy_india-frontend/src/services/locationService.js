/**
 * locationService.js
 * High-Precision Indian Delivery Location & Postal Area Resolution Service
 * - Live GPS Detective with High-Accuracy coordinates & network fallback
 * - Official India Post API (api.postalpincode.in) for 100% accurate Indian Area & District resolution
 * - Real-time BigDataCloud & Nominatim reverse geocoding
 */

import { getCustomerDeliveryPincode, setCustomerDeliveryPincode, syncCatalogFromBackend } from './catalogSyncService';

const rawApiBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-1ezb.onrender.com/api').trim().replace(/\/+$/, '');
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

/**
 * Lookup official Indian area name, district, and state from official India Post API
 */
export async function lookupPostalPincode(pin) {
  const clean = String(pin || '').trim();
  if (!/^\d{6}$/.test(clean)) return null;

  // 1. Official India Post Postal API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const offices = data[0].PostOffice;
        
        // Extract District and State
        const district = offices[0]?.District || offices[0]?.Division || '';
        const state = offices[0]?.State || 'India';

        // Extract list of all branch post offices / sub-areas in this pincode
        const postAreas = Array.from(new Set(offices.map(o => o.Name).filter(Boolean)));

        // By default, use clean District name as the area name (e.g. Dharmapuri, Krishnagiri, New Delhi)
        const areaName = district || offices[0]?.Name || 'Local Area';

        return {
          pincode: clean,
          areaName: areaName,
          district: district,
          state: state,
          postAreas: postAreas,
          valid: true
        };
      }
    }
  } catch (err) {
    console.debug('India Post API error, trying backend lookup:', err);
  }

  // 2. Fallback to Spring Boot Backend /api/pincodes/lookup
  try {
    const bRes = await fetch(`${API_BASE}/pincodes/lookup?pincode=${clean}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (bRes.ok) {
      const bData = await bRes.json();
      if (bData.valid) {
        const areaName = bData.district || 'Regional Hub';
        return {
          pincode: clean,
          areaName: areaName,
          district: bData.district,
          state: bData.state || 'India',
          postAreas: bData.officeName ? [bData.officeName] : [],
          valid: true
        };
      }
    }
  } catch (err) {
    console.debug('Backend pincode lookup error:', err);
  }

  // 3. Fallback for common PINs if offline
  const fallbackAreas = {
    '635002': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', postAreas: ['Krishnagiri Indl. Estate', 'Kattinayanapalli', 'Krishnagiri'] },
    '635122': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', postAreas: ['Krishnagiri Indl. Estate', 'Bayanapalli'] },
    '635001': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', postAreas: ['Krishnagiri', 'Dowlatabad', 'Kattinayanapalli'] },
    '635201': { areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', postAreas: ['Arasampatti', 'Barur', 'Bendrahalli', 'Irumathur', 'Thathampatti'] },
    '635202': { areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', postAreas: ['Kambainallore', 'D Thurinjipatti', 'Ichambadi', 'Jakkupatti'] },
    '635109': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', postAreas: ['Hosur', 'Mookandapalli', 'Zuzuvadi'] },
    '110001': { areaName: 'New Delhi', district: 'New Delhi', state: 'Delhi', postAreas: ['Connaught Place', 'Janpath', 'Parliament Street'] },
    '560001': { areaName: 'Bengaluru', district: 'Bengaluru', state: 'Karnataka', postAreas: ['Bengaluru G.P.O.', 'Raj Bhavan', 'Vidhana Soudha'] },
    '600001': { areaName: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postAreas: ['George Town', 'Chennai G.P.O.', 'Parrys'] },
    '400001': { areaName: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', postAreas: ['Fort', 'Stock Exchange', 'Bazargate'] },
    '700001': { areaName: 'Kolkata', district: 'Kolkata', state: 'West Bengal', postAreas: ['Kolkata G.P.O.', 'Dalhousie Square', 'Fairlie Place'] }
  };

  if (fallbackAreas[clean]) {
    return {
      pincode: clean,
      ...fallbackAreas[clean],
      valid: true
    };
  }

  return {
    pincode: clean,
    areaName: `Area (${clean})`,
    district: 'Local Zone',
    state: 'India',
    postAreas: [],
    valid: true
  };
}

/**
 * Returns formatted short location label for search bar
 */
export function getShortLocationLabel(pin, explicitCity = '') {
  const p = String(pin || '').trim();
  if (!p) return 'Select Area';

  if (explicitCity && explicitCity.trim() && explicitCity !== 'India') {
    // If city is long (e.g. "Kambainallore, Dharmapuri"), take the main city/district
    const shortCity = explicitCity.split(',')[0].trim();
    return `${shortCity} (${p})`;
  }

  try {
    const cached = localStorage.getItem('atomy_customer_delivery_city');
    if (cached && cached.trim() && cached !== 'India') {
      const shortCity = cached.split(',')[0].trim();
      return `${shortCity} (${p})`;
    }
  } catch {}

  return `PIN ${p}`;
}

/**
 * Returns full descriptive label for active hub/area
 */
export function getHubLabel(pin, explicitCity = '') {
  const p = String(pin || '').trim();
  const city = explicitCity || (() => {
    try {
      return localStorage.getItem('atomy_customer_delivery_city') || '';
    } catch {
      return '';
    }
  })();

  if (city && city.trim() && city !== 'India') {
    return `${city.trim()} (${p})`;
  }

  return p ? `Area (${p})` : 'Select Area';
}

/**
 * Reverse geocode GPS coordinates to Indian postal PIN and verify with India Post
 * Uses official OpenStreetMap Nominatim and BigDataCloud without any hardcoded bounding boxes.
 */
async function reverseGeocodeCoords(lat, lon) {
  // 1. Primary: Secure backend reverse geocoding (queries OpenStreetMap with valid server User-Agent, bypassing browser CORS/403 blocks)
  try {
    const rawApiBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-1ezb.onrender.com/api').trim().replace(/\/+$/, '');
    const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;
    const res = await fetch(`${API_BASE}/pincodes/reverse-geocode?lat=${lat}&lon=${lon}`, {
      signal: AbortSignal.timeout(6500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.valid && data.pincode && /^\d{6}$/.test(data.pincode)) {
        return {
          pincode: data.pincode,
          city: data.city,
          district: data.district,
          state: data.state,
          method: 'gps'
        };
      }
    }
  } catch (err) {
    console.debug('Backend reverse geocode error, trying client fallbacks:', err);
  }

  // 2. Secondary: Direct OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`;
    const res = await fetch(nomUrl, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      let postcode = String(addr.postcode || '').replace(/\D/g, '').trim();

      if (/^\d{6}$/.test(postcode)) {
        const localArea = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Your Area';
        const district = addr.state_district || addr.county || localArea;
        const state = addr.state || 'India';
        const postalInfo = await lookupPostalPincode(postcode);

        return {
          pincode: postcode,
          city: postalInfo?.areaName || localArea,
          district: postalInfo?.district || district,
          state: postalInfo?.state || state,
          method: 'gps'
        };
      }
    }
  } catch (err) {
    console.debug('Nominatim reverse geocode error:', err);
  }

  // 2. Secondary: BigDataCloud reverse geocode client
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      let rawPostcode = String(data.postcode || '').replace(/\D/g, '').trim();
      const localArea = data.locality || data.city || data.principalSubdivision || 'Your Area';
      const state = data.principalSubdivision || 'India';

      if (/^\d{6}$/.test(rawPostcode)) {
        const postalInfo = await lookupPostalPincode(rawPostcode);
        return {
          pincode: rawPostcode,
          city: postalInfo?.areaName || localArea,
          district: postalInfo?.district || data.city || localArea,
          state: postalInfo?.state || state,
          method: 'gps'
        };
      }
    }
  } catch (err) {
    console.debug('BigDataCloud reverse geocode error:', err);
  }

  // 3. Tertiary: OpenStreetMap Nominatim broader postal zone search (zoom 14)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1`;
    const res = await fetch(nomUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AtomyIndiaCommerce/2.0 (contact@atomy.in)'
      },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      let postcode = String(addr.postcode || '').replace(/\D/g, '').trim();

      if (/^\d{6}$/.test(postcode)) {
        const localArea = addr.town || addr.village || addr.city || addr.county || 'Your Area';
        const district = addr.state_district || addr.county || localArea;
        const state = addr.state || 'India';
        const postalInfo = await lookupPostalPincode(postcode);

        return {
          pincode: postcode,
          city: postalInfo?.areaName || localArea,
          district: postalInfo?.district || district,
          state: postalInfo?.state || state,
          method: 'gps'
        };
      }
    }
  } catch (err) {
    console.debug('Nominatim broader search error:', err);
  }

  return null;
}

/**
 * Real device GPS location detection (Hardware GPS & Wi-Fi triangulation)
 * Strictly uses device GPS and NEVER uses inaccurate ISP IP geolocation.
 */
export async function detectCustomerLiveLocation({ force = false } = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return resolve(null);
    }

    const runGeoQuery = (options) => {
      return new Promise((resGeo, rejGeo) => {
        navigator.geolocation.getCurrentPosition(resGeo, rejGeo, options);
      });
    };

    // 1. High Accuracy Hardware GPS with 15s timeout
    runGeoQuery({ enableHighAccuracy: true, timeout: 15000, maximumAge: force ? 0 : 30000 })
      .catch(() => {
        // 2. Standard Accuracy fallback (WiFi / cell triangulated)
        return runGeoQuery({ enableHighAccuracy: false, timeout: 8000, maximumAge: force ? 0 : 60000 });
      })
      .then(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocodeCoords(latitude, longitude);
          if (loc && loc.pincode) {
            applyDetectedLocation(loc);
            return resolve(loc);
          }
        } catch (e) {
          console.debug('Reverse geocode error:', e);
        }
        resolve(null);
      })
      .catch((geoErr) => {
        console.debug('GPS hardware query error/denied:', geoErr?.message || geoErr);
        resolve(null);
      });
  });
}

/**
 * Apply detected location into localStorage, state, and broadcast to all components
 */
export function applyDetectedLocation(loc) {
  if (!loc || !loc.pincode) return;
  const pin = String(loc.pincode).trim();
  const city = loc.city || loc.areaName || 'Local Zone';
  const state = loc.state || 'India';

  try {
    localStorage.setItem('atomy_customer_delivery_pincode', pin);
    localStorage.setItem('atomy_customer_delivery_city', city);
    localStorage.setItem('atomy_customer_delivery_state', state);
    localStorage.setItem('atomy_location_autodetected_v2', 'true');
  } catch {}

  setCustomerDeliveryPincode(pin);

  // Broadcast change across header, cart, and catalog
  window.dispatchEvent(
    new CustomEvent('atomy_pincode_changed', {
      detail: { pincode: pin, city: city, state: state }
    })
  );

  // Sync regional catalog stock immediately
  syncCatalogFromBackend(pin).catch(() => {});
}
