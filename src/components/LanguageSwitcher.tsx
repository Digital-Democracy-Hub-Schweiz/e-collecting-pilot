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

  const triggerBase = "w-auto min-w-[64px] rounded px-2";
  const triggerDefault = "h-8 text-[16px] leading-[24px] border border-[#e0e4e8] bg-white text-[#1f2937] hover:bg-[#f5f6f7] focus:ring-2 focus:ring-[#d8232a]";
  const triggerTopbar = "h-6 text-[16px] leading-[24px] border border-white/0 bg-transparent text-white hover:bg-white/0 focus:ring-0";
  const triggerClass = `${triggerBase} ${variant === 'topbar' ? triggerTopbar : triggerDefault}`;

  const contentClass = "min-w-[120px] bg-white border border-[#e0e4e8] shadow-lg";
  const itemClass = "data-[state=checked]:bg-[#f5f6f7] data-[highlighted]:bg-[#f5f6f7] focus:bg-[#f5f6f7]";

  return (
    <div className="flex items-center">
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger aria-label={t('common:language', 'Sprache')} className={triggerClass}>
          <SelectValue>
            <span>{i18n.language.toUpperCase()}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={contentClass} align="end">
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