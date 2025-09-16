import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Share2, Printer } from "lucide-react";
import { useMatch, useLocation } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { useTranslation } from 'react-i18next';
import { parseRouteFromPath, useCurrentLanguage, routeTranslations } from "@/utils/routing";
import PageContainer from "@/components/PageContainer";
const Index = () => {
  const { t } = useTranslation(['common', 'content']);
  const location = useLocation();
  const currentLang = useCurrentLanguage();
  const routeInfo = parseRouteFromPath(location.pathname);
  
  // Legacy route matching for backwards compatibility
  const initiativeMatch = useMatch("/initiative/:id");
  const referendumMatch = useMatch("/referendum/:id");
  const volksbegehrenMatch = useMatch("/volksbegehren/:id");
  
  // New localized route matching - use actual route translations
  const normalizedVolksRoute = routeTranslations[currentLang]?.volksbegehren ?? 'volksbegehren';
  const localizedVolksbegehrenMatch = useMatch(`/${currentLang}/${normalizedVolksRoute}/:id`);
  const {
    data: healthStatus,
    isLoading: healthLoading
  } = useHealthStatus();
  const volksbegehren = useVolksbegehren();
  
  // Normalisieren der Volksbegehren-Daten unter Verwendung der sprachspezifischen IDs
  const normalized = (volksbegehren as any[]).map((item, idx) => {
    const title: string = item?.title ?? "";
    const providedSlug: string = String(item?.slug || "").trim();
    const computedSlug = title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = providedSlug || computedSlug;
    // Use the id from the JSON data, fallback to slug or computed id for backward compatibility
    const id = item?.id || slug || String(idx + 1);
    const type = String(item?.type ?? "").toLowerCase() === "referendum" ? "Referendum" : "Initiative";
    return {
      id,
      slug,
      type,
      title,
      wording: item?.wording ?? "",
      startDate: item?.start_date ?? "",
      endDate: item?.end_date ?? "",
      level: item?.level ?? "",
      pdf: item?.pdf_url ?? ""
    };
  });
  const resolveId = (list: any[], value?: string) => {
    if (!value) return undefined;
    const found = list.find(item => item?.id === value || item?.slug === value);
    return found?.id;
  };
  const preselect: {
    type: "Initiative" | "Referendum";
    id: string;
  } | undefined = (() => {
    // Priority 1: New localized routes (works for all languages)
    if (routeInfo.route === 'volksbegehren' && routeInfo.params.id) {
      return {
        type: (normalized.find(i => i.id === routeInfo.params.id || i.slug === routeInfo.params.id)?.type || "Initiative") as "Initiative" | "Referendum",
        id: resolveId(normalized as any[], routeInfo.params.id) || routeInfo.params.id
      };
    }
    
    // Priority 2: Localized match (backup for direct route matching)
    if (localizedVolksbegehrenMatch) {
      return {
        type: (normalized.find(i => i.id === localizedVolksbegehrenMatch.params.id || i.slug === localizedVolksbegehrenMatch.params.id)?.type || "Initiative") as "Initiative" | "Referendum",
        id: resolveId(normalized as any[], localizedVolksbegehrenMatch.params.id as string) || localizedVolksbegehrenMatch.params.id as string
      };
    }
    
    // Priority 3: Legacy routes (backwards compatibility)
    if (volksbegehrenMatch) {
      return {
        type: (normalized.find(i => i.id === volksbegehrenMatch.params.id || i.slug === volksbegehrenMatch.params.id)?.type || "Initiative") as "Initiative" | "Referendum",
        id: resolveId(normalized as any[], volksbegehrenMatch.params.id as string) || volksbegehrenMatch.params.id as string
      };
    }
    
    if (initiativeMatch) {
      return {
        type: "Initiative",
        id: resolveId(normalized.filter(i => i.type === "Initiative"), initiativeMatch.params.id as string) || initiativeMatch.params.id as string
      };
    }
    
    if (referendumMatch) {
      return {
        type: "Referendum",
        id: resolveId(normalized.filter(i => i.type === "Referendum"), referendumMatch.params.id as string) || referendumMatch.params.id as string
      };
    }
    
    return undefined;
  })();
  
  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = document.title || 'Teilen';
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link kopiert.');
      } else {
        window.prompt('Link kopieren:', url);
      }
    } catch (_) {
      // Abbruch durch Nutzer ignorieren
    }
  };
  const handlePrint = () => window.print();

  return <div className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Skip to main content - Swiss Design System requirement */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      {/* Main Content */}
      <main id="main-content">
        {/* Breadcrumb Section (Figma) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">{t('common:breadcrumb.home')}</a> <span className="inline-block mx-[7px]">›</span> {t('common:breadcrumb.pilot')}
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section (Figma) */}
        <section className="bg-white">
          <PageContainer className="h-[52px] flex items-center justify-end gap-3">
            <button type="button" aria-label="Teilen" onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Share2 className="w-5 h-5" aria-hidden />
            </button>
            <button type="button" aria-label="Drucken" onClick={handlePrint} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Printer className="w-5 h-5" aria-hidden />
            </button>
          </PageContainer>
        </section>

        {/* Hero-Abschnitt (Figma, responsive Container/Typo) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-14 md:py-16 flex flex-col items-start">
              <h1 className="sd-h1 max-w-[1024px]">
                {t('content:homepage.hero.title')}
              </h1>
              <div className="h-6 md:h-10" />
              <p className="sd-lead max-w-[1024px]">
                {t('content:homepage.hero.description')}
              </p>
            </div>
            <div className="h-24 opacity-0" />
          </PageContainer>
        </section>

        {/* Formular-Band: grauer Hintergrund und Figma-Spacing */}
        <section className="bg-[#f1f4f7] sd-section-py-comfort">
          <ReceiptCredentialIssuer preselect={preselect} />
        </section>


        {/*
        {/* Carousel Sektion: Darstellung der Volksbegehren gemäss Figma Medienmitteilungen 
        <section className="bg-white">
          <MediaCarousel heading={t('content:volksbegehren', 'Volksbegehren')} items={carouselItems} />
        </section>
      */}

        {/* Spacer vor Footer (Figma: 96px)
        <section className="bg-white">
          <PageContainer paddingYClassName="py-24">{null}</PageContainer>
        </section> */}
      </main>
      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </div>;
};
export default Index;
