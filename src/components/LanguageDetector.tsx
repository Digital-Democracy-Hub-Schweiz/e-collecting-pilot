import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { detectUserLanguage } from '@/utils/routing';

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