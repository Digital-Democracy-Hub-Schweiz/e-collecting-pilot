import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VolksbegehrenItem {
  id: string;
  type: string;
  level: string;
  title: string;
  slug: string;
  comitee: string | null;
  wording: string;
  start_date: string;
  end_date: string;
  show: boolean;
  pdf_url?: string;
}

export const useVolksbegehren = () => {
  const { i18n } = useTranslation();
  const [volksbegehren, setVolksbegehren] = useState<VolksbegehrenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVolksbegehren = async () => {
      try {
        const { data, error } = await supabase
          .from('volksbegehren')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const currentLang = i18n.language as 'de' | 'fr' | 'it' | 'rm' | 'en';
          
          const formattedData = data.map(item => ({
            id: item.slug, // Use slug as id for backward compatibility
            type: item.type,
            level: item.level,
            title: item[`title_${currentLang}`] || item.title_de || '',
            slug: item.slug,
            comitee: item.comitee,
            wording: item[`description_${currentLang}`] || item.description_de || '',
            start_date: item.start_date || '',
            end_date: item.end_date || '',
            show: true
          }));

          setVolksbegehren(formattedData);
        }
      } catch (error) {
        console.error('Error loading volksbegehren:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVolksbegehren();
  }, [i18n.language]);

  return { volksbegehren, isLoading };
};