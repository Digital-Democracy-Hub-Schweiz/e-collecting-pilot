import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type SupportedLanguage } from '@/utils/routing';

// Detect user's preferred language from browser
const detectUserLanguage = (): SupportedLanguage => {
  // Try localStorage first (user's previous choice)
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && ['de', 'fr', 'it', 'rm', 'en'].includes(savedLang)) {
    return savedLang as SupportedLanguage;
  }

  // Try browser language
  const browserLang = navigator.language.toLowerCase();
  
  // Direct matches
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('rm')) return 'rm';
  if (browserLang.startsWith('en')) return 'en';
  
  // Check all browser languages
  const browserLanguages = navigator.languages || [navigator.language];
  for (const lang of browserLanguages) {
    const langCode = lang.toLowerCase().substring(0, 2);
    if (['de', 'fr', 'it', 'rm', 'en'].includes(langCode)) {
      return langCode as SupportedLanguage;
    }
  }
  
  // Fallback to German
  return 'de';
};

interface LanguageDetectorProps {
  children: React.ReactNode;
}

export const LanguageDetector = ({ children }: LanguageDetectorProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // If URL has no language prefix or invalid language prefix
    if (pathSegments.length === 0 || !['de', 'fr', 'it', 'rm', 'en'].includes(pathSegments[0])) {
      const detectedLang = detectUserLanguage();
      
      if (pathSegments.length === 0) {
        // Root path - redirect to detected language
        navigate(`/${detectedLang}`, { replace: true });
      } else {
        // Path without language prefix - add detected language
        const newPath = `/${detectedLang}/${pathSegments.join('/')}`;
        navigate(newPath, { replace: true });
      }
      return;
    }
    
    // Valid language prefix exists - save to localStorage for future visits
    const currentLang = pathSegments[0];
    localStorage.setItem('i18nextLng', currentLang);
  }, [location.pathname, navigate]);
  
  return <>{children}</>;
};