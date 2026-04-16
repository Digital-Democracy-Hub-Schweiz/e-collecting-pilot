import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
  const currentLang = i18n.language as 'de' | 'fr' | 'it' | 'rm' | 'en';

  const { data: volksbegehren = [], isLoading } = useQuery<VolksbegehrenItem[]>({
    queryKey: ['volksbegehren', currentLang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volksbegehren')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.slug,
        type: item.type,
        level: item.level,
        title: item[`title_${currentLang}`] || item.title_de || '',
        slug: item.slug,
        comitee: item.comitee,
        wording: item[`description_${currentLang}`] || item.description_de || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        show: true,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  return { volksbegehren, isLoading };
};
