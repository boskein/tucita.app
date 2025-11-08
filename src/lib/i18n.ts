// Basic i18n structure for ES/EN
// Full implementation can be added later

export type Locale = 'es' | 'en';

export const defaultLocale: Locale = 'es';

export const supportedLocales: Locale[] = ['es', 'en'];

// Translation keys structure (not fully translated yet)
export const translations: Record<Locale, Record<string, string>> = {
  es: {
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    
    // Navigation
    'nav.overview': 'Resumen',
    'nav.services': 'Servicios',
    'nav.staff': 'Personal',
    'nav.schedule': 'Horarios',
    'nav.bookings': 'Reservas',
    'nav.settings': 'Configuración',
    
    // Add more translations as needed
  },
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    
    // Navigation
    'nav.overview': 'Overview',
    'nav.services': 'Services',
    'nav.staff': 'Staff',
    'nav.schedule': 'Schedule',
    'nav.bookings': 'Bookings',
    'nav.settings': 'Settings',
    
    // Add more translations as needed
  },
};

/**
 * Get translation for a key
 * @param key Translation key
 * @param locale Locale to use (defaults to defaultLocale)
 * @returns Translated string or key if not found
 */
export function t(key: string, locale: Locale = defaultLocale): string {
  return translations[locale]?.[key] || key;
}

/**
 * Get current locale (placeholder for future implementation)
 */
export function getLocale(): Locale {
  // In the future, this could read from localStorage, URL, or user preferences
  return defaultLocale;
}

/**
 * Set locale (placeholder for future implementation)
 */
export function setLocale(locale: Locale): void {
  // In the future, this could save to localStorage or update URL
  console.log('Setting locale to:', locale);
}
