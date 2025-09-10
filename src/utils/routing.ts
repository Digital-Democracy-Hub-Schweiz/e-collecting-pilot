import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Route translations mapping
export const routeTranslations = {
  de: {
    volksbegehren: 'volksbegehren',
    impressum: 'impressum'
  },
  fr: {
    volksbegehren: 'objet-votation-populaire',
    impressum: 'impressum'
  },
  it: {
    volksbegehren: 'oggetto-votazione-popolare',
    impressum: 'impressum'
  },
  rm: {
    volksbegehren: 'dumonda-populara',
    impressum: 'impressum'
  },
  en: {
    volksbegehren: 'popular-vote',
    impressum: 'impressum'
  }
};

export type SupportedLanguage = keyof typeof routeTranslations;
export type RouteKey = keyof typeof routeTranslations.de;

// Generate localized URL
export const getLocalizedPath = (
  lang: SupportedLanguage,
  route: RouteKey,
  params?: Record<string, string>
): string => {
  const translatedRoute = routeTranslations[lang]?.[route] || route;
  let path = `/${lang}/${translatedRoute}`;
  
  if (params && params.id) {
    path += `/${params.id}`;
  }
  
  return path;
};

// Hook to get current language from URL
export const useCurrentLanguage = (): SupportedLanguage => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0) {
    const langFromUrl = pathSegments[0] as SupportedLanguage;
    if (routeTranslations[langFromUrl]) {
      return langFromUrl;
    }
  }
  
  // Fallback to German
  return 'de';
};

// Generate all language variants of a URL
export const getAllLanguageVariants = (
  route: RouteKey,
  params?: Record<string, string>
): Record<SupportedLanguage, string> => {
  const variants: Record<SupportedLanguage, string> = {} as Record<SupportedLanguage, string>;
  
  (Object.keys(routeTranslations) as SupportedLanguage[]).forEach(lang => {
    variants[lang] = getLocalizedPath(lang, route, params);
  });
  
  return variants;
};

// Parse route from current path to determine what type of content to display
export const parseRouteFromPath = (pathname: string): {
  lang: SupportedLanguage;
  route: RouteKey | null;
  params: Record<string, string>;
} => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return { lang: 'de', route: null, params: {} };
  }
  
  const lang = pathSegments[0] as SupportedLanguage;
  if (!routeTranslations[lang]) {
    return { lang: 'de', route: null, params: {} };
  }
  
  if (pathSegments.length === 1) {
    return { lang, route: null, params: {} };
  }
  
  const routeSegment = pathSegments[1];
  
  // Find the route key by looking up the translation
  let routeKey: RouteKey | null = null;
  for (const [key, value] of Object.entries(routeTranslations[lang])) {
    if (value === routeSegment) {
      routeKey = key as RouteKey;
      break;
    }
  }
  
  // Extract additional parameters (like volksbegehren ID)
  const params: Record<string, string> = {};
  if (pathSegments.length > 2) {
    params.id = pathSegments[2];
  }
  
  return { lang, route: routeKey, params };
};