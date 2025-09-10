import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { parseRouteFromPath, getLocalizedPath, type SupportedLanguage } from "@/utils/routing";

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'rm', name: 'Rumantsch', flag: '🇨🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageChange = (languageCode: string) => {
    const newLang = languageCode as SupportedLanguage;
    const routeInfo = parseRouteFromPath(location.pathname);
    
    // Generate the new URL for the selected language
    let newPath = `/${newLang}`;
    
    if (routeInfo.route && routeInfo.params.id) {
      // If we're on a specific route with parameters (like volksbegehren detail)
      newPath = getLocalizedPath(newLang, routeInfo.route, routeInfo.params);
    } else if (routeInfo.route === 'impressum') {
      // For impressum page
      newPath = `/${newLang}/impressum`;
    }
    
    // Change language and navigate
    i18n.changeLanguage(languageCode);
    navigate(newPath);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm border-0 bg-transparent hover:bg-muted/50 focus:ring-1 focus:ring-primary">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
              <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[160px]" align="end">
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code} className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <span>{language.flag}</span>
                <span>{language.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {language.code.toUpperCase()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};