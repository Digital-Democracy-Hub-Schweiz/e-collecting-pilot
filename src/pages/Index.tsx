import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Gallery6 } from "@/components/ui/gallery6";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { Shield, Building2, Github, Coffee, Heart } from "lucide-react";
import { useMatch, useLocation } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
import { parseRouteFromPath, getLocalizedPath, useCurrentLanguage } from "@/utils/routing";
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
  return <body className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Skip to main content - Swiss Design System requirement */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      {/* Header following Swiss Design System structure */}
      <header id="main-header">
        {/* Top Bar - All Swiss Federal Authorities */}
        <div className="top-bar text-white border-b border-white/20" style={{
        backgroundColor: '#13678A'
      }}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                
                
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                  
                  
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Header - Main department info */}
        <div className="top-header bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <a href={`/${currentLang}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                {/* Swiss Cross Logo */}
                <div className="h-12 bg-white flex items-center justify-center">
                  
                </div>
                {/* Beta Logo */}
                <div className="flex items-center">
                  <img src="/lovable-uploads/e75dd54e-b28f-48bc-8d17-683d07664c09.png" alt="Beta" className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                  <div className="text-base font-medium text-[hsl(var(--gov-nav-text))] leading-tight">{t('content:header.title')}</div>
                </div>
              </a>
              <div className="flex items-center gap-6 ml-auto">
                <nav className="meta-navigation hidden lg:flex items-center gap-4 text-sm">
                  
                  
                </nav>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Menu - Main Navigation */}
        

        {/* Mobile Menu - Hidden by default, shown on mobile */}
        <div className="mobile-menu hidden">
          {/* Mobile navigation would be implemented here */}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Container section with max width */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-8">
            {/* Receipt Credential Issuer with Info Box */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ReceiptCredentialIssuer preselect={preselect} />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-muted/30 border border-muted rounded-lg p-6 space-y-4">
                <h1 className="text-lg font-semibold text-foreground">{t('content:homepage.infoBox.title')}</h1>
                  <p className="text-sm text-muted-foreground">{t('content:homepage.infoBox.description')}</p>

                  <h2 className="text-lg font-semibold text-foreground">{t('content:homepage.infoBox.participationTitle')}</h2>
                  <h3 className="text-lg font-semibold text-foreground">{t('content:homepage.infoBox.eidTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('content:homepage.infoBox.eidDescription')}
                  </p>

          
                  <h3 className="text-lg font-semibold text-foreground">{t('content:homepage.infoBox.swiyuTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('content:homepage.infoBox.swiyuDescription')}
                  </p>
                  <div className="space-y-2">
                    <a href="https://apps.apple.com/ch/app/swiyu/id6737259614" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:text-primary/80 underline underline-offset-4">
                      {t('content:homepage.infoBox.links.ios')}
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=ch.admin.foitt.swiyu&pli=1" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:text-primary/80 underline underline-offset-4">
                      {t('content:homepage.infoBox.links.android')}
                    </a>
                    <a href="https://www.bcs.admin.ch/bcs-web/" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:text-primary/80 underline underline-offset-4">
                      {t('content:homepage.infoBox.links.betaId')}
                    </a>
                  </div>

                </div>
              </div>
            </div>
            <VerificationDashboard />
          </div>
        </section>

        {/* Full width section */}
        <section id="verfuegbare-initiativen-referenden" className="border-t">
          <Gallery6 heading={t('content:homepage.carousel.title')} items={carouselItems} availableLevels={availableLevels} />
        </section>

        {/* Support Section */}
        <section id="e-collecting-ausprobieren" className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-foreground">{t('content:homepage.tryECollecting.title')}</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t('content:homepage.tryECollecting.download.title')}</h3>
                    <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: t('content:homepage.tryECollecting.download.description') }}>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t('content:homepage.tryECollecting.betaId.title')}</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p dangerouslySetInnerHTML={{ __html: t('content:homepage.tryECollecting.betaId.steps.1') }}></p>
                      <p dangerouslySetInnerHTML={{ __html: t('content:homepage.tryECollecting.betaId.steps.2') }}></p>
                      <p dangerouslySetInnerHTML={{ __html: t('content:homepage.tryECollecting.betaId.steps.3') }}></p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <a href="https://www.bcs.admin.ch/bcs-web/" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">
                        {t('content:homepage.tryECollecting.betaId.links.create')}
                      </a>
                      <a href="https://backend.eid.admin.ch/fileservice/sdweb-docs-prod-eidch-files/files/2025/03/25/509a3b49-1305-4838-be91-9985e3182adf.pdf" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">
                        {t('content:homepage.tryECollecting.betaId.links.guide')}
                      </a>
                    </div>
                  </div>

                  
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img src="/lovable-uploads/f29ac8cf-3603-4085-b35e-af7ed0bee35b.png" alt="E-Collecting Pilotprojekt - Digital Democracy Hub Schweiz App Interface" className="max-w-md w-full h-auto" />
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Financial Support Section */}
        <section className="bg-gradient-to-br from-orange-50 to-yellow-50 border-t">
          
        </section>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="text-white" style={{
      backgroundColor: '#13678A'
    }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Über E-Collecting Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">{t('common:footer.project')}</h2>
              <p className="text-sm text-white/80 leading-relaxed">{t('content:footer.projectDescription')}</p>
              <p className="text-sm text-white mt-6" dangerouslySetInnerHTML={{ __html: t('content:footer.copyright') }}>
              </p>
              <p className="text-sm text-white mt-2">{t('content:footer.dataCredit')}</p>
            </div>

            {/* Bleiben Sie informiert Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">{t('common:footer.stayInformed')}</h2>
              <div className="space-y-3">
                <a href="https://links.ecollecting.ch/newsletter" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/30 text-white text-sm rounded hover:bg-white/10 transition-colors">
                  {t('common:footer.newsletter')}
                  <span>→</span>
                </a>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <h3 className="text-base font-medium mb-3">{t('common:footer.contact')}</h3>
                <div className="space-y-2 text-sm text-white">
                  <p>{t('content:footer.contact.organization')}</p>
                  
                  <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.email') }}></p>
                  <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.web') }}></p>
                </div>
              </div>
            </div>

            {/* Weitere Informationen Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">{t('common:footer.externalLinks')}</h2>
              <div className="space-y-3">
                <a href="https://www.eid.admin.ch/de" target="_blank" rel="noopener noreferrer" className="block text-sm text-white hover:text-white/80 transition-colors underline underline-offset-4">
                  {t('content:footer.externalLinks.swiyuWallet')}
                </a>
                <a href="https://www.bcs.admin.ch/bcs-web/" target="_blank" rel="noopener noreferrer" className="block text-sm text-white hover:text-white/80 transition-colors underline underline-offset-4">
                  {t('content:footer.externalLinks.betaIdService')}
                </a>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <h3 className="text-base font-medium mb-3">{t('common:footer.systemStatus')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white">{t('common:footer.services.verifierMgmt')}:</span>
                  {healthLoading ? <span className="text-white">{t('common:loading')}</span> : <span className={`font-medium ${healthStatus?.verifierManagement?.status === "UP" ? "text-green-100" : "text-red-100"}`}>
                      {healthStatus?.verifierManagement?.status || t('common:offline')}
                    </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white">{t('common:footer.services.issuerMgmt')}:</span>
                  {healthLoading ? <span className="text-white">{t('common:loading')}</span> : <span className={`font-medium ${healthStatus?.issuerManagement?.status === "UP" ? "text-green-100" : "text-red-100"}`}>
                      {healthStatus?.issuerManagement?.status || t('common:offline')}
                    </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white">{t('common:footer.services.issuerOid4vci')}:</span>
                  {healthLoading ? <span className="text-white">{t('common:loading')}</span> : <span className={`font-medium ${healthStatus?.issuerOid4vci?.status === "UP" ? "text-green-100" : "text-red-100"}`}>
                      {healthStatus?.issuerOid4vci?.status || t('common:offline')}
                    </span>}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Footer links */}
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-sm text-white flex items-center gap-2">
                  {t('common:footer.madeWith')}{" "}
                  <a href="https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors" aria-label="GitHub Repository">
                    <Github size={16} />
                  </a>
                </p>
                <VersionSwitcher />
                <a href="https://links.ecollecting.ch/buy-me-a-coffee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium rounded-full transition-colors">
                  {t('common:footer.buyMeCoffee')}
                </a>
              </div>
              <a href={`/${currentLang}/impressum`} className="text-sm text-white hover:text-white/80 transition-colors underline underline-offset-4">
                {t('common:navigation.impressum')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </body>;
};
export default Index;