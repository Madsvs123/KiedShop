import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enNav from './locales/en/nav.json';
import enHome from './locales/en/home.json';
import enProducts from './locales/en/products.json';
import enCommon from './locales/en/common.json';
import enAdmin from './locales/en/admin.json';
import enPages from './locales/en/pages.json';

import arNav from './locales/ar/nav.json';
import arHome from './locales/ar/home.json';
import arProducts from './locales/ar/products.json';
import arCommon from './locales/ar/common.json';
import arAdmin from './locales/ar/admin.json';
import arPages from './locales/ar/pages.json';

// Arabic-speaking country codes (ISO 3166-1 alpha-2)
const ARABIC_COUNTRIES = [
  'SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB',
  'PS', 'IQ', 'YE', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO',
  'SY', 'EH'
];

/**
 * Try to detect the user's country from their IP address using a free geolocation API.
 * Falls back to browser language detection if the API call fails.
 */
const detectCountryByIP = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code || data.country || null;
  } catch {
    // Fallback: try ip-api.com (free, no token needed)
    try {
      const res = await fetch('https://ip-api.com/json/?fields=countryCode', {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.countryCode || null;
    } catch {
      return null;
    }
  }
};

/**
 * Resolve the best language for the user:
 * 1. Check if there's a saved preference in localStorage
 * 2. Detect country from IP → Arabic if in an Arabic country
 * 3. Fall back to browser language
 */
const resolveLanguage = async () => {
  const saved = localStorage.getItem('i18nextLng');
  if (saved && ['en', 'ar'].includes(saved)) return saved;

  // Try country detection
  try {
    const countryCode = await detectCountryByIP();
    if (countryCode && ARABIC_COUNTRIES.includes(countryCode.toUpperCase())) {
      return 'ar';
    }
  } catch {
    // Fall through to browser language
  }

  // Browser language fallback
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  if (browserLang.startsWith('ar')) return 'ar';
  return 'en';
};

// Map of country → language for quick reference
export const isArabicCountry = (countryCode) =>
  ARABIC_COUNTRIES.includes((countryCode || '').toUpperCase());

// Initialize i18n asynchronously
export const initI18n = async () => {
  const lng = await resolveLanguage();

  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng,
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      resources: {
        en: {
          nav: enNav,
          home: enHome,
          products: enProducts,
          common: enCommon,
          admin: enAdmin,
          pages: enPages,
        },
        ar: {
          nav: arNav,
          home: arHome,
          products: arProducts,
          common: arCommon,
          admin: arAdmin,
          pages: arPages,
        },
      },
      ns: ['nav', 'home', 'products', 'common', 'admin', 'pages'],
      defaultNS: 'common',
    });
};

export default i18n;
