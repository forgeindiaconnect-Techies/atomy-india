/**
 * locationService.js - Mobile Location & Postal Area Resolution Service
 * - High-Accuracy GPS Detective via navigator.geolocation & BigDataCloud & Nominatim
 * - Official India Post API (api.postalpincode.in) for Area & District resolution
 * - Accurate coordinate bounds for Dharmapuri (635202), Krishnagiri (635002), Hosur (635109), Bengaluru (560001), Chennai (600001)
 * - Subscribable location updates for Header and Shopping Mall views
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import storageService from './storageService';
import { setCustomerDeliveryPincode, syncCatalogFromBackend } from './catalogSyncService';
import { fetchHubDetails } from './api';

const listeners = new Set();

export function addLocationListener(cb) {
  if (typeof cb === 'function') {
    listeners.add(cb);
  }
  return () => listeners.delete(cb);
}

export function notifyLocationListeners(locationData) {
  listeners.forEach((cb) => {
    try {
      cb(locationData);
    } catch (e) {
      console.debug('Location listener error:', e);
    }
  });
}

/**
 * Known Indian postal areas for instant / reliable resolution
 */
export const KNOWN_AREAS = {
  '635202': { areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', hubName: 'Krishnapuram Regional Hub' },
  '635201': { areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', hubName: 'Krishnapuram Regional Hub' },
  '635002': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', hubName: 'Selva Regional Logistics Hub' },
  '635001': { areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', hubName: 'Selva Regional Logistics Hub' },
  '635109': { areaName: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', hubName: 'Hosur Logistics Point' },
  '560001': { areaName: 'Bengaluru', district: 'Bengaluru', state: 'Karnataka', hubName: 'Karnataka Regional Center' },
  '600001': { areaName: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', hubName: 'Chennai Central Fulfillment' },
  '110001': { areaName: 'New Delhi', district: 'New Delhi', state: 'Delhi', hubName: 'Delhi NCR Hub' },
  '400001': { areaName: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', hubName: 'Western India Fulfillment Center' },
  '700001': { areaName: 'Kolkata', district: 'Kolkata', state: 'West Bengal', hubName: 'Eastern India Logistics Hub' },
};

/**
 * Lookup official Indian area name from India Post API
 */
export async function lookupPostalPincode(pin) {
  const clean = String(pin || '').trim();
  if (!/^\d{6}$/.test(clean)) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const offices = data[0].PostOffice;
        const district = offices[0]?.District || offices[0]?.Division || '';
        const state = offices[0]?.State || 'India';
        const areaName = district || offices[0]?.Name || 'Local Area';
        return {
          pincode: clean,
          areaName,
          district,
          state,
          valid: true,
        };
      }
    }
  } catch (err) {}

  if (KNOWN_AREAS[clean]) {
    return {
      pincode: clean,
      ...KNOWN_AREAS[clean],
      valid: true,
    };
  }

  return {
    pincode: clean,
    areaName: `Area (${clean})`,
    district: 'Local Zone',
    state: 'India',
    valid: true,
  };
}

/**
 * Returns formatted short location label: e.g. "Krishnagiri (635002)" or "Dharmapuri (635202)"
 */
export function getShortLocationLabel(pin, explicitCity = '') {
  const p = String(pin || '').trim() || storageService.getDeliveryPincode() || '635002';
  const c = explicitCity || storageService.getDeliveryCity() || '';

  if (c && c.trim() && c !== 'India') {
    const shortCity = c.split(',')[0].trim();
    return `${shortCity} (${p})`;
  }

  if (KNOWN_AREAS[p]) {
    return `${KNOWN_AREAS[p].areaName} (${p})`;
  }

  return `Area (${p})`;
}

/**
 * Reverse geocode coordinates to Indian postal PIN and verify
 */
async function reverseGeocodeCoords(lat, lon) {
  // 1. BigDataCloud reverse geocode client
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let rawPostcode = String(data.postcode || '').trim();
      const city = String(data.city || '').toLowerCase();
      const locality = String(data.locality || '').toLowerCase();
      const subDiv = String(data.principalSubdivision || '').toLowerCase();

      if (locality.includes('dharmapuri') || city.includes('dharmapuri')) {
        return { pincode: '635202', city: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', method: 'gps' };
      }
      if (locality.includes('hosur') || city.includes('hosur')) {
        return { pincode: '635109', city: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps' };
      }
      if (locality.includes('krishnagiri') || city.includes('krishnagiri') || rawPostcode === '635122') {
        return { pincode: '635002', city: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps' };
      }

      if (rawPostcode && /^\d{6}$/.test(rawPostcode)) {
        const postalInfo = await lookupPostalPincode(rawPostcode);
        if (postalInfo) {
          return {
            pincode: rawPostcode,
            city: postalInfo.areaName,
            district: postalInfo.district,
            state: postalInfo.state,
            method: 'gps',
          };
        }
      }
    }
  } catch (err) {}

  // 2. OpenStreetMap Nominatim reverse geocode fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(nomUrl, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      let postcode = String(addr.postcode || '').trim();
      const town = String(addr.town || addr.city || addr.county || addr.state_district || '').toLowerCase();

      if (town.includes('dharmapuri')) {
        return { pincode: '635202', city: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', method: 'gps' };
      }
      if (town.includes('hosur')) {
        return { pincode: '635109', city: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps' };
      }
      if (town.includes('krishnagiri') || postcode === '635122') {
        return { pincode: '635002', city: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps' };
      }
      if (postcode && /^\d{6}$/.test(postcode)) {
        const postalInfo = await lookupPostalPincode(postcode);
        if (postalInfo) {
          return {
            pincode: postcode,
            city: postalInfo.areaName,
            district: postalInfo.district,
            state: postalInfo.state,
            method: 'gps',
          };
        }
      }
    }
  } catch (err) {}

  // 3. High-Precision Coordinate Bounding Boxes
  // Dharmapuri bounding box: lat 11.90 - 12.25, lon 78.00 - 78.35
  if (lat >= 11.90 && lat <= 12.25 && lon >= 78.00 && lon <= 78.35) {
    return { pincode: '635202', city: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', method: 'gps_box' };
  }
  // Krishnagiri bounding box: lat 12.30 - 12.75, lon 78.05 - 78.50
  if (lat >= 12.30 && lat <= 12.75 && lon >= 78.05 && lon <= 78.50) {
    return { pincode: '635002', city: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps_box' };
  }
  // Hosur bounding box: lat 12.65 - 12.85, lon 77.75 - 77.95
  if (lat >= 12.65 && lat <= 12.85 && lon >= 77.75 && lon <= 77.95) {
    return { pincode: '635109', city: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'gps_box' };
  }
  // Bengaluru
  if (lat >= 12.8 && lat <= 13.2 && lon >= 77.4 && lon <= 77.8) {
    return { pincode: '560001', city: 'Bengaluru', district: 'Bengaluru', state: 'Karnataka', method: 'gps_box' };
  }
  // Chennai
  if (lat >= 12.9 && lat <= 13.3 && lon >= 80.1 && lon <= 80.4) {
    return { pincode: '600001', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', method: 'gps_box' };
  }

  return null;
}

/**
 * IP-based location fallback
 */
async function detectLocationViaIP() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        let postal = String(data.postal || '').trim();
        const ipCity = String(data.city || data.region || '').toLowerCase();

        if (ipCity.includes('dharmapuri')) {
          return { pincode: '635202', city: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', method: 'ip' };
        }
        if (ipCity.includes('hosur')) {
          return { pincode: '635109', city: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'ip' };
        }
        if (ipCity.includes('krishnagiri') || postal === '635122') {
          return { pincode: '635002', city: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', method: 'ip' };
        }

        if (postal && /^\d{6}$/.test(postal)) {
          const postalInfo = await lookupPostalPincode(postal);
          if (postalInfo) {
            return {
              pincode: postal,
              city: postalInfo.areaName,
              district: postalInfo.district,
              state: postalInfo.state,
              method: 'ip',
            };
          }
        }
      }
    }
  } catch (err) {}

  return null;
}

/**
 * Apply detected location into storage, backend sync, and broadcast
 */
export async function applyDetectedLocation(loc) {
  if (!loc || !loc.pincode) return;
  let pin = String(loc.pincode).trim();
  if (pin === '635122') pin = '635002';
  
  let city = loc.city || loc.areaName || '';
  if (!city && KNOWN_AREAS[pin]) {
    city = KNOWN_AREAS[pin].areaName;
  }
  if (!city) city = 'Krishnagiri';

  const state = loc.state || (KNOWN_AREAS[pin] ? KNOWN_AREAS[pin].state : 'Tamil Nadu');

  await storageService.saveDeliveryLocation(pin, city, state);
  await setCustomerDeliveryPincode(pin);

  // Fetch hub details for connected regional hub
  let hubDetails = null;
  try {
    hubDetails = await fetchHubDetails(pin);
  } catch (e) {}

  notifyLocationListeners({
    pincode: pin,
    city,
    state,
    hubDetails,
    method: loc.method || 'manual',
  });

  // Sync regional catalog stock immediately
  syncCatalogFromBackend(pin).catch(() => {});

  return { pincode: pin, city, state, hubDetails };
}

/**
 * Detect customer's current/live location (Native GPS via expo-location -> Web GPS -> Storage -> Fallback)
 */
export async function detectCustomerLiveLocation({ force = false } = {}) {
  const fallbackLoc = {
    pincode: '635002',
    city: 'Krishnagiri',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
    method: 'default',
  };

  // 1. High-Precision Native Device GPS via expo-location (Android / iOS / Web)
  try {
    let perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      perm = await Location.requestForegroundPermissionsAsync();
    }

    if (perm.status === 'granted') {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (position?.coords) {
        const { latitude, longitude } = position.coords;

        // A. Native reverse geocoding via device OS (Native mobile only; web uses reverseGeocodeCoords)
        if (Platform.OS !== 'web') {
          try {
            const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (Array.isArray(geocoded) && geocoded.length > 0) {
              const g = geocoded[0];
              const rawPostal = String(g.postalCode || '').trim();
              const cityName = g.city || g.subregion || g.district || g.region || '';
              const stateName = g.region || 'Tamil Nadu';

              if (rawPostal && /^\d{6}$/.test(rawPostal)) {
                let cleanPin = rawPostal;
                if (cleanPin === '635122') cleanPin = '635002';
                const postalInfo = await lookupPostalPincode(cleanPin);
                const loc = {
                  pincode: cleanPin,
                  city: postalInfo?.areaName || cityName || 'Krishnagiri',
                  district: postalInfo?.district || g.subregion || g.district || cityName,
                  state: postalInfo?.state || stateName,
                  method: 'expo_gps',
                };
                await applyDetectedLocation(loc);
                return loc;
              }
            }
          } catch (geoErr) {}
        }

        // B. High-Precision Coordinate Bounding Boxes & Reverse Geocoding Clients
        const loc = await reverseGeocodeCoords(latitude, longitude);
        if (loc && loc.pincode) {
          await applyDetectedLocation(loc);
          return loc;
        }
      }
    }
  } catch (err) {
    console.debug('Expo native location detection note:', err?.message || err);
  }

  // 2. Web / Browser navigator.geolocation fallback
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const navLoc = await new Promise((resolveNav) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const loc = await reverseGeocodeCoords(latitude, longitude);
              if (loc && loc.pincode) {
                await applyDetectedLocation(loc);
                return resolveNav(loc);
              }
            } catch (e) {}
            resolveNav(null);
          },
          () => resolveNav(null),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: force ? 0 : 60000 }
        );
      });
      if (navLoc && navLoc.pincode) {
        return navLoc;
      }
    } catch (e) {}
  }

  // 3. User Saved / Selected Location:
  // If the customer already has a valid delivery pin saved (e.g. Krishnagiri 635002 or Dharmapuri 635202),
  // NEVER overwrite it with an inaccurate cellular ISP tower (which resolves to Chennai 600001).
  const savedPin = storageService.getDeliveryPincode();
  const savedCity = storageService.getDeliveryCity();
  if (savedPin && savedPin !== '600001' && /^\d{6}$/.test(savedPin)) {
    const loc = {
      pincode: savedPin,
      city: savedCity || (KNOWN_AREAS[savedPin] ? KNOWN_AREAS[savedPin].areaName : 'Krishnagiri'),
      district: KNOWN_AREAS[savedPin]?.district || 'Krishnagiri',
      state: storageService.getDeliveryState() || 'Tamil Nadu',
      method: 'saved',
    };
    await applyDetectedLocation(loc);
    return loc;
  }

  // 4. IP-based location fallback (filtering out misleading Chennai 600001 mobile cell towers)
  const ipLoc = await detectLocationViaIP();
  if (ipLoc && ipLoc.pincode && ipLoc.pincode !== '600001') {
    await applyDetectedLocation(ipLoc);
    return ipLoc;
  }

  // 5. Default to Primary Operational Hub: Krishnagiri (635002) - Selva Atomy Regional Hub
  await applyDetectedLocation(fallbackLoc);
  return fallbackLoc;
}

const locationService = {
  lookupPostalPincode,
  getShortLocationLabel,
  detectCustomerLiveLocation,
  applyDetectedLocation,
  addLocationListener,
  notifyLocationListeners,
  KNOWN_AREAS,
};

export default locationService;
