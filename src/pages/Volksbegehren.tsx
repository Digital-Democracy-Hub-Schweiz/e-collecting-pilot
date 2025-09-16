import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useHealthStatus } from "@/hooks/use-health-status";
import PageContainer from "@/components/PageContainer";
import { Share2, Printer } from "lucide-react";
import { useCurrentLanguage, getLocalizedPath, type SupportedLanguage } from "@/utils/routing";
import { useTranslation } from "react-i18next";
import React from "react";

const Volksbegehren = () => {
  const { t } = useTranslation(['common', 'content']);
  const { data: healthStatus, isLoading: healthLoading } = useHealthStatus();
  const currentLang = useCurrentLanguage();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = document.title || t('common:share');
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert(t('common:copy') + ' ' + url);
      } else {
        window.prompt(t('common:copy') + ':', url);
      }
    } catch (_err) {
      // ignore share errors
    }
  };
  const handlePrint = () => window.print();

  return (
    <body className="min-h-screen bg-white flex flex-col">
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb (wie Projekt) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">{t('common:breadcrumb.home')}</a> <span className="inline-block mx-[7px]">›</span> {t('common:breadcrumb.volksbegehren')}
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section (wie Projekt) */}
        <section className="bg-white">
          <PageContainer className="h-[52px] flex items-center justify-end gap-3">
            <button type="button" aria-label={t('common:share')} onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Share2 className="w-5 h-5" aria-hidden />
            </button>
            <button type="button" aria-label={t('common:print')} onClick={handlePrint} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Printer className="w-5 h-5" aria-hidden />
            </button>
          </PageContainer>
        </section>

        {/* Hero Titelblock (wie Projekt) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-8 md:py-14 lg:py-16 flex flex-col items-start">
              <h1 className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937] max-w-[1024px]">{t('content:volksbegehren.title')}</h1>
              <div className="h-4 md:h-6 lg:h-10" />
              <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] font-medium text-[#1f2937] max-w-[1024px]">
                {t('content:volksbegehren.description')}
              </p>
              <div className="h-4 md:h-6 lg:h-14" />
            </div>
          </PageContainer>
        </section>

        {/* Initiativen Block (Figma-Vorlage) */}
        <DataDrivenSections />
      </main>

      {/* Spacer vor Footer */}
      <section className="bg-white">
        <PageContainer paddingYClassName="py-12 sm:py-16 md:py-20 lg:py-24">{null}</PageContainer>
      </section>

      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </body>
  );
};

export default Volksbegehren;

type VolksbegehrenItem = {
  id: string;
  type: 'initiative' | 'referendum';
  level: string;
  title: string;
  slug: string;
  comitee: string;
  wording: string;
  start_date: string; // ISO
  end_date: string;   // ISO
  show: boolean;
  image?: string;
};

const DataDrivenSections: React.FC = () => {
  const { t } = useTranslation(['content']);
  const lang: SupportedLanguage = useCurrentLanguage();
  const [items, setItems] = React.useState<VolksbegehrenItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    try {
      const modules = import.meta.glob<Record<string, unknown>>('/src/data/volksbegehren/*.json', { eager: true });
      const path = `/src/data/volksbegehren/${lang}.json`;
      const fallbackPath = `/src/data/volksbegehren/de.json`;
      const mod = (modules[path] ?? modules[fallbackPath]) as { default?: unknown } | undefined;
      const raw = (mod && (mod as { default?: unknown }).default) as unknown;
      const data = (Array.isArray(raw) ? (raw as unknown[]) : []) as VolksbegehrenItem[];
      if (!canceled) {
        setItems(Array.isArray(data) ? data.filter(d => d.show !== false) : []);
        setLoading(false);
      }
    } catch (e) {
      if (!canceled) {
        setError(t('content:volksbegehren.error'));
        setLoading(false);
      }
    }
    return () => {
      canceled = true;
    };
  }, [lang]);

  if (loading) {
    return (
      <section className="bg-white">
        <PageContainer paddingYClassName="py-8">
          <div className="text-[#6b7280]">{t('content:volksbegehren.loading')}</div>
        </PageContainer>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white">
        <PageContainer paddingYClassName="py-8">
          <div className="text-red-600">{error}</div>
        </PageContainer>
      </section>
    );
  }

  const initiatives = items.filter(i => i.type === 'initiative');
  const referendums = items.filter(i => i.type === 'referendum');

  return (
    <>
      <SectionCardRow title="Initiativen" items={initiatives} lang={lang} />
      <SectionCardRow title="Referenden" items={referendums} lang={lang} />
    </>
  );
};

type SectionCardRowProps = { title: string; items: VolksbegehrenItem[]; lang: string };

const SectionCardRow: React.FC<SectionCardRowProps> = ({ title, items, lang }) => {
  const [page, setPage] = React.useState(0);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);
  React.useEffect(() => {
    // Reset page if items change and current page is out of range
    if (page >= totalPages) setPage(0);
  }, [items, totalPages, page]);

  return (
    <section className="bg-white">
      <PageContainer>
        {/* Section title */}
        <div className="py-6 md:py-8">
          <h2 className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937]">
            {title}
          </h2>
        </div>

        {/* Carousel row with nav arrows */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Zurück"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-[#5c6977] hover:text-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 97 96" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor">
              <path d="M59.4324 22.816L44.0324 49.492L59.4324 76.168L56.8364 77.668L40.5684 49.492L56.8364 21.316L59.4324 22.816Z" />
            </svg>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 flex-1 min-w-0">
          {visible.map(card => (
            <article key={card.id} className="bg-white shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)] w-full">
              <div className="pt-6 px-4 pb-6 sm:pt-7 sm:px-5 sm:pb-7 md:pt-9 md:px-7 md:pb-7">
                {/* Meta */}
                <div className="text-[12px] leading-[16px] sm:text-[14px] sm:leading-[18px] text-[#6b7280] flex items-center gap-[8px] sm:gap-[10px]">
                  <span className="font-medium">{card.level}</span>
                  <span aria-hidden className="text-center w-[16px] sm:w-[21px]">|</span>
                  <span className="font-medium">{`${formatDate(card.start_date, lang)} bis ${formatDate(card.end_date, lang)}`}</span>
                </div>
                <div className="h-3 sm:h-4" />
                {/* Title */}
                <h3 className="text-[20px] leading-[28px] sm:text-[22px] sm:leading-[30px] md:text-[24px] md:leading-[32px] font-semibold text-[#1f2937] leading-snug">{card.title}</h3>
                <div className="h-3 sm:h-4" />
                {/* Description */}
                <p className="text-[16px] leading-[24px] sm:text-[17px] sm:leading-[26px] md:text-[18px] md:leading-[28px] text-[#1f2937]">{card.wording}</p>
                <div className="h-3 sm:h-4" />
                {/* Image (optional) */}
                {card.image ? (
                  <div className="bg-[#f1f4f7] h-[200px] sm:h-[240px] md:h-[280px] w-full flex items-center justify-center rounded-t-[2px] overflow-hidden">
                    <img src={card.image} alt="" className="h-full object-contain" />
                  </div>
                ) : null}
                <div className="h-4 sm:h-6" />
                <div className="h-6 sm:h-8 md:h-10" />
                {/* Button (icon-only, bordered) */}
                <div className="flex justify-end">
                  <a
                    href={getLocalizedPath(lang as SupportedLanguage, 'volksbegehren', { id: card.slug || card.id })}
                    aria-label="Mehr"
                    className="relative border border-[#d8232a] rounded-[1px] p-1.5 sm:p-2 text-[#d8232a] hover:bg-[#d8232a]/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right sm:w-5 sm:h-5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
          </div>

          <button
            type="button"
            aria-label="Weiter"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-[#5c6977] hover:text-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 97 96" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rotate-180" fill="currentColor">
              <path d="M59.4324 22.816L44.0324 49.492L59.4324 76.168L56.8364 77.668L40.5684 49.492L56.8364 21.316L59.4324 22.816Z" />
            </svg>
          </button>
        </div>

        {/* Dots (dynamic) */}
        <div className="flex items-center justify-center gap-2 py-6 sm:py-8 md:py-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Seite ${i + 1}`}
              onClick={() => setPage(i)}
              className={"w-1.5 h-1.5 rounded-full " + (i === page ? "bg-[#1f2937]" : "bg-[#adb4bc]")}
            />
          ))}
        </div>
      </PageContainer>
    </section>
  );
};

function formatDate(iso: string, lang: string) {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  } catch {
    return iso;
  }
}
