/**
 * Utility to ensure all images in mobile app load at crystal-clear high definition
 * Strips downsampling query parameters (?w=480&h=480, ?w=610) to deliver original uncompressed CDN assets
 */
export function getHighResImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url
    .replace(/[?&]w=\d+&h=\d+/g, '')
    .replace(/[?&]w=\d+/g, '')
    .replace(/[?&]h=\d+/g, '')
    .replace(/\?$/, '');
}

export default getHighResImageUrl;
