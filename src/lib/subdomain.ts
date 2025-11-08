/**
 * Extract tenant slug from pathname pattern: /{t}/{slug}/...
 * Returns null if pattern doesn't match
 */
export function extractTenantFromPath(pathname: string): { t: string; slug: string } | null {
  const match = pathname.match(/^\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return null;
  }
  return {
    t: match[1],
    slug: match[2],
  };
}

/**
 * Get tenant slug from hostname (for future subdomain support)
 * Example: barberia-elite.tucitas.app -> barberia-elite
 */
export function getTenantSlugFromHost(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // If we have subdomain support: subdomain.domain.com
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

/**
 * Validate tenant slug format
 * Allows lowercase letters, numbers, and hyphens
 */
export function validateTenantSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
}

/**
 * Generate slug from business name
 */
export function generateSlug(name: string | undefined | null): string {
  if (!name || typeof name !== 'string') {
    return 'business';
  }
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}
