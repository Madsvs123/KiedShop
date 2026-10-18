import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Wraps the app to handle RTL direction changes based on the current language.
 * Must be rendered inside ChakraProvider (uses useTranslation).
 */
const I18nInitWrapper = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRtl = i18n.language === 'ar';

    // Update the <html> dir attribute
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Add/remove the rtl class on <html> for any CSS overrides
    document.documentElement.classList.toggle('rtl', isRtl);
    document.documentElement.classList.toggle('ltr', !isRtl);

    // For Chakra UI: update the ChakraProvider direction
    // We rely on CSS direction and the rtl/ltr class
  }, [i18n.language]);

  return <>{children}</>;
};

export default I18nInitWrapper;
