import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { MediaCarousel } from "@/components/MediaCarousel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Header } from "@/components/Header";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { Footer } from "@/components/Footer";
import { Shield, Building2, Github, Coffee, Heart, Share2, Printer } from "lucide-react";
import { useMatch, useLocation } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
import { parseRouteFromPath, getLocalizedPath, useCurrentLanguage } from "@/utils/routing";
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
  const routeTranslations = {
    de: 'volksbegehren',
    fr: 'objet-votation-populaire',
    it: 'oggetto-votazione-popolare',
    rm: 'dumonda-populara',
    en: 'popular-vote'
  };
  const localizedVolksbegehrenMatch = useMatch(`/${currentLang}/${routeTranslations[currentLang as keyof typeof routeTranslations]}/:id`);
  const {
    data: healthStatus,
    isLoading: healthLoading,
    isError: healthError
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
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch {
      return '';
    }
  };
  const getDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `ab ${start}`;
    } else if (end) {
      return `bis ${end}`;
    }
    return '';
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
  
  // Prepare data for carousel - only show items with show: true
  const carouselItems = normalized.filter((item: any) => volksbegehren.find((vb: any) => vb.title === item.title)?.show === true).map((item: any) => {
    const dateRange = getDateRange(item.startDate, item.endDate);
    return {
      id: item.id,
      title: item.title,
      summary: `${item.type}: ${item.wording}`,
      dateRange: dateRange,
      url: getLocalizedPath(currentLang, 'volksbegehren', { id: item.slug }),
      image: "/placeholder.svg",
      slug: item.slug,
      type: item.type as "Initiative" | "Referendum",
      level: item.level,
      pdf: item.pdf
    };
  });

  // Extract unique levels from the displayed items
  const availableLevels = Array.from(new Set(carouselItems.map(item => item.level).filter(Boolean))).sort();
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
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">Startseite</a> <span className="inline-block mx-[7px]">›</span> Pilot
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

        {/* Hero-Abschnitt (Figma) */}
        <section className="bg-white">
          <div className="box-border flex flex-col items-start justify-start px-[452px] py-0">
            <div className="h-14 opacity-0" />
            <div className="w-full">
              <h1 className="text-[40px] leading-[48px] font-semibold text-[#1f2937]">Initiativen und Referenden unterstützen</h1>
            </div>
            <div className="h-10 opacity-0" />
            <div className="w-full">
              <p className="text-[22px] leading-[33px] font-medium text-[#1f2937] max-w-[1200px]">
                Testen Sie jetzt E-Collecting, um Initiativen und Referenden digital zu unterstützen. Verwenden Sie dafür die Beta-ID des Bundes für Volksbegehren. Es werden keine persönlichen Daten gespeichert.
              </p>
            </div>
            <div className="h-24 opacity-0" />
          </div>
        </section>

        {/* Formular-Band: grauer Hintergrund und Figma-Spacing */}
        <section className="bg-[#f1f4f7]">
          <div className="max-w-[2000px] mx-auto px-[597px] py-20">
            <ReceiptCredentialIssuer preselect={preselect} />
          </div>
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