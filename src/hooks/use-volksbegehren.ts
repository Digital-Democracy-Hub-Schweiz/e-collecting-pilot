import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

// Import all language data files
import volksbegehrenDE from '@/data/volksbegehren/de.json';
import volksbegehrenFR from '@/data/volksbegehren/fr.json';
import volksbegehrenIT from '@/data/volksbegehren/it.json';
import volksbegehrenRM from '@/data/volksbegehren/rm.json';
import volksbegehrenEN from '@/data/volksbegehren/en.json';

const volksbegehrenData = {
  de: volksbegehrenDE,
  fr: volksbegehrenFR,
  it: volksbegehrenIT,
  rm: volksbegehrenRM,
  en: volksbegehrenEN,
};

export const useVolksbegehren = () => {
  const { i18n } = useTranslation();

  const volksbegehren = useMemo(() => {
    const currentLanguage = i18n.language as keyof typeof volksbegehrenData;
    return volksbegehrenData[currentLanguage] || volksbegehrenData.de;
  }, [i18n.language]);

  return volksbegehren;
};