// Language Service for Atomy India Multi-Language Support (English, Hindi, Tamil)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English(India)', nativeLabel: 'English(India)', flag: '🇮🇳', region: 'India' },
  { code: 'hi', label: 'हिंदी(India)', nativeLabel: 'हिंदी(India)', flag: '🇮🇳', region: 'India' },
  { code: 'ta', label: 'தமிழ்(India)', nativeLabel: 'தமிழ்(India)', flag: '🇮🇳', region: 'India' }
];

const STORAGE_KEY = 'atomy_selected_language';

export const getSavedLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
};

// Set google translate cookie for current domain and root
export const setGoogleTranslateCookie = (langCode) => {
  try {
    const val = langCode === 'en' ? '' : `/en/${langCode}`;
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';

    // Clear previous cookies first
    document.cookie = `googtrans=; expires=${pastDate}; path=/;`;
    if (!isLocal) {
      document.cookie = `googtrans=; expires=${pastDate}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=; expires=${pastDate}; path=/; domain=.${hostname};`;
    }

    if (langCode && langCode !== 'en') {
      // Set host-only cookie (works everywhere, including localhost)
      document.cookie = `googtrans=${val}; path=/;`;
      if (!isLocal) {
        document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
        document.cookie = `googtrans=${val}; path=/; domain=.${hostname};`;
      }
    }
  } catch (e) {
    console.error('Failed to set translate cookie', e);
  }
};

// Tag all product titles, images, prices, and language picker modal with notranslate
export const markElementsAsNoTranslate = () => {
  try {
    const selectors = [
      '.product-title',
      '.food-product-title',
      '.brand-product-title',
      '.pdp-official-title',
      '.crumb-current',
      '.cate-product-name',
      '.product-name-link',
      '.favorite-product-name',
      '.detail-product-name',
      '.cart-item-title',
      '.order-sheet-product-name',
      '.review-product-name',
      '.product-img',
      '.product-img-wrap',
      '.product-price',
      '.member-dp-price',
      '.price-original',
      '.price-val',
      '.dp-price-amount',
      '.active-member-pv',
      '.team-phoenix-title',
      '.team-phoenix-sub',
      '.atomy-corner-brand-wrapper',
      '.region-selector-btn',
      '.lang-region-modal-backdrop',
      '.lang-region-modal-card',
      '.lang-radio-group',
      '.lang-radio-label',
      '.lang-radio-text'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach((el) => {
      if (!el.classList.contains('notranslate')) {
        el.classList.add('notranslate');
        el.setAttribute('translate', 'no');
      }
    });
  } catch {
    // ignore
  }
};

export const cleanGoogleTranslateBanner = () => {
  try {
    const banners = document.querySelectorAll(
      'iframe.goog-te-banner-frame, iframe.skiptranslate, .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, iframe[id*=":1.container"], iframe[id*=":2.container"]'
    );
    banners.forEach((b) => {
      b.style.setProperty('display', 'none', 'important');
      b.style.setProperty('visibility', 'hidden', 'important');
      b.style.setProperty('height', '0px', 'important');
      b.style.setProperty('width', '0px', 'important');
      b.style.setProperty('opacity', '0', 'important');
      b.style.setProperty('pointer-events', 'none', 'important');
    });

    if (document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.setProperty('top', '0px', 'important');
    }
  } catch {
    // ignore
  }
};

// Initialize language observer to protect dynamically loaded products
let observerInitialized = false;
export const initLanguageObserver = () => {
  if (observerInitialized || typeof window === 'undefined') return;
  observerInitialized = true;

  markElementsAsNoTranslate();
  cleanGoogleTranslateBanner();

  const observer = new MutationObserver(() => {
    markElementsAsNoTranslate();
    cleanGoogleTranslateBanner();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Periodic safeguard
  setInterval(cleanGoogleTranslateBanner, 500);
};

// Change active language
export const changeLanguage = (langCode) => {
  try {
    console.log('[LanguageService] Changing language to:', langCode);
    localStorage.setItem(STORAGE_KEY, langCode);
    setGoogleTranslateCookie(langCode);

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      if (typeof select.onchange === 'function') {
        select.onchange();
      }
    }

    markElementsAsNoTranslate();
    window.dispatchEvent(new CustomEvent('atomy:language-changed', { detail: { language: langCode } }));

    // Reload page to guarantee clean translation without React Virtual DOM corruption
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (e) {
    console.error('Error changing language:', e);
    window.location.reload();
  }
};
