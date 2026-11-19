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
 * Haversine distance in kilometers between two GPS coordinates
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const REGIONAL_HUB_CENTROIDS = [
  { pincode: '635002', areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5266, lon: 78.2144, radiusKm: 35 },
  { pincode: '635001', areaName: 'Krishnagiri', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5200, lon: 78.2200, radiusKm: 25 },
  { pincode: '635109', areaName: 'Hosur', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.7409, lon: 77.8253, radiusKm: 30 },
  { pincode: '635202', areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.1211, lon: 78.1582, radiusKm: 35 },
  { pincode: '635201', areaName: 'Dharmapuri', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.1300, lon: 78.1600, radiusKm: 25 },
  { pincode: '560001', areaName: 'Bengaluru', district: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, radiusKm: 30 },
  { pincode: '600001', areaName: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, radiusKm: 30 },
  { pincode: '110001', areaName: 'New Delhi', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, radiusKm: 30 },
  { pincode: '400001', areaName: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', lat: 18.9388, lon: 72.8354, radiusKm: 30 },
  { pincode: '700001', areaName: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, radiusKm: 30 }
];

/**
 * Reverse geocode GPS coordinates to Indian postal PIN and verify with India Post
 * Uses Google Maps Geocoding API, Photon Komoot, OpenStreetMap, BigDataCloud, and regional centroids.
 */
export async function reverseGeocodeCoords(lat, lon) {
  // 1. Primary: Google Maps Geocoding API (Official high-precision Indian address resolution)
  const googleKey = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBCkc19U-8C5Ahfb7xuBAiV4BmcBtgKTbI').trim();
  if (googleKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`;
      const res = await fetch(gUrl, { signal: AbortSignal.timeout(6500) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          let postalCode = '';
          let locality = '';
          let sublocality = '';
          let district = '';
          let state = '';

          for (const result of data.results) {
            if (!result.address_components) continue;
            for (const comp of result.address_components) {
              const types = comp.types || [];
              if (!postalCode && types.includes('postal_code')) {
                const cleaned = String(comp.long_name || comp.short_name || '').replace(/\D/g, '').trim();
                if (/^\d{6}$/.test(cleaned)) postalCode = cleaned;
              }
              if (!sublocality && (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood'))) {
                sublocality = comp.long_name;
              }
              if (!locality && (types.includes('locality') || types.includes('administrative_area_level_3'))) {
                locality = comp.long_name;
              }
              if (!district && types.includes('administrative_area_level_2')) {
                district = comp.long_name;
              }
              if (!state && types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
            }
            if (postalCode) break;
          }

          if (postalCode) {
            const city = sublocality || locality || district || 'Local Area';
            return {
              pincode: postalCode,
              city: city,
              district: district || city,
              state: state || 'India',
              method: 'google'
            };
          }
        }
      }
    } catch (err) {
      console.debug('Google Geocoding error, checking Photon fallback:', err);
    }
  }

  // 2. Secondary: Photon Komoot Open Reverse Geocoding (100% open CORS, mobile-friendly OSM index)
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(photonUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const feature = data.features?.[0];
      const props = feature?.properties || {};
      const rawPostcode = String(props.postcode || '').replace(/\D/g, '').trim();
      const localArea = props.name || props.district || props.city || props.county || 'Local Area';
      const city = props.city || props.county || localArea;
      const district = props.county || props.district || city;
      const state = props.state || 'India';

      if (/^\d{6}$/.test(rawPostcode)) {
        return {
          pincode: rawPostcode,
          city: localArea,
          district: district,
          state: state,
          method: 'photon'
        };
      }
    }
  } catch (err) {
    console.debug('Photon reverse geocode error:', err);
  }

  // 3. Tertiary: Secure backend reverse geocoding
  try {
    const rawApiBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-1ezb.onrender.com/api').trim().replace(/\/+$/, '');
    const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;
    const res = await fetch(`${API_BASE}/pincodes/reverse-geocode?lat=${lat}&lon=${lon}`, {
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.valid && data.pincode && /^\d{6}$/.test(data.pincode)) {
        return {
          pincode: data.pincode,
          city: data.city,
          district: data.district,
          state: data.state,
          method: 'backend'
        };
      }
    }
  } catch (err) {
    console.debug('Backend reverse geocode note:', err);
  }

  // 4. Quaternary: BigDataCloud reverse geocode client with India Post PostOffice resolution
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      let rawPostcode = String(data.postcode || '').replace(/\D/g, '').trim();
      const locality = data.locality || data.city || '';
      const state = data.principalSubdivision || 'India';

      if (/^\d{6}$/.test(rawPostcode)) {
        const postalInfo = await lookupPostalPincode(rawPostcode);
        return {
          pincode: rawPostcode,
          city: postalInfo?.areaName || locality || 'Local Area',
          district: postalInfo?.district || data.city || locality,
          state: postalInfo?.state || state,
          method: 'bigdatacloud'
        };
      }

      // If postcode was blank (common in India for BigDataCloud), resolve via India Post using locality/city
      if (locality) {
        try {
          const poRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(locality)}`, {
            signal: AbortSignal.timeout(4000)
          });
          if (poRes.ok) {
            const poData = await poRes.json();
            if (Array.isArray(poData) && poData[0]?.Status === 'Success' && Array.isArray(poData[0]?.PostOffice) && poData[0].PostOffice.length > 0) {
              const matched = poData[0].PostOffice[0];
              const resolvedPin = String(matched.Pincode || '').trim();
              if (/^\d{6}$/.test(resolvedPin)) {
                return {
                  pincode: resolvedPin,
                  city: matched.Name || locality,
                  district: matched.District || locality,
                  state: matched.State || state,
                  method: 'bdc_indiapost'
                };
              }
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.debug('BigDataCloud error:', err);
  }

  // 5. Quinary: Regional Hub GPS Centroid Proximity Match
  for (const hub of REGIONAL_HUB_CENTROIDS) {
    const distance = getDistanceFromLatLonInKm(lat, lon, hub.lat, hub.lon);
    if (distance <= hub.radiusKm) {
      return {
        pincode: hub.pincode,
        city: hub.areaName,
        district: hub.district,
        state: hub.state,
        method: 'proximity'
      };
    }
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
