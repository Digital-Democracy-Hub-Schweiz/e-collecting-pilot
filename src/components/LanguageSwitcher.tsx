import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NativeSelect } from "@/components/ui/native-select";
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

  const baseClasses = "w-auto min-w-[64px] rounded-[1px] px-2";
  const variantClasses = variant === 'topbar' 
    ? "h-6 text-[16px] leading-[24px] border border-transparent bg-transparent text-white hover:bg-white/10 focus:ring-0" 
    : "h-8 text-[16px] leading-[24px] border border-[#e0e4e8] bg-white text-[#1f2937] hover:bg-[#f5f6f7] focus:ring-0";

  return (
    <div className="flex items-center">
      <NativeSelect
        id="language-selector"
        aria-label={t('common:language', 'Sprache')}
        options={languages.map(lang => ({
          value: lang.code,
          label: lang.code.toUpperCase(),
          displayLabel: lang.code.toUpperCase()
        }))}
        value={i18n.language}
        onValueChange={handleLanguageChange}
        className={`${baseClasses} ${variantClasses}`}
      />
    </div>
  );
};