import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SupportedLanguage } from "@/utils/routing";

const languages = [
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'rm', name: 'Rumantsch' },
  { code: 'en', name: 'English' },
];

type LanguageSwitcherProps = {
  variant?: 'default' | 'topbar';
};

export const LanguageSwitcher = ({ variant = 'default' }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (languageCode: string) => {
    const newLang = languageCode as SupportedLanguage;
    const newPath = `/${newLang}`;
    i18n.changeLanguage(languageCode);
    navigate(newPath);
  };

  const triggerBase = "w-auto min-w-[64px] rounded-[1px] px-2";
  // Default: kleiner Chip-Select mit 32/40 Höhe gemäss Header-Design? Wir bleiben bei 32px.
  const triggerDefault = "h-8 text-[16px] leading-[24px] border border-[#e0e4e8] bg-white text-[#1f2937] hover:bg-[#f5f6f7] focus:ring-0";
  // Topbar: transparent, weisse Typo, 24px Höhe gemäss Figma-Topbar
  const triggerTopbar = "h-6 text-[16px] leading-[24px] border border-transparent bg-transparent text-white hover:bg-transparent focus:ring-0";
  const triggerClass = `${triggerBase} ${variant === 'topbar' ? triggerTopbar : triggerDefault}`;

  const contentClass = "min-w-[120px] bg-white border border-[#e0e4e8] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)] rounded-[1px] z-50";
  const itemClass = "py-2 text-[16px] leading-[24px] data-[state=checked]:bg-[#f5f6f7] data-[highlighted]:bg-[#f5f6f7] focus:bg-[#f5f6f7]";

  return (
    <div className="flex items-center relative">
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger
          aria-label={t('common:language', 'Sprache')}
          className={triggerClass}
          variant={variant === 'topbar' ? 'topbar' : 'default'}
        >
          <SelectValue>
            <span>{i18n.language.toUpperCase()}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={contentClass} align="end" position="popper" sideOffset={4}>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code} className={itemClass}>
              <span>{language.code.toUpperCase()}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};