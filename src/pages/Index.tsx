import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Gallery6 } from "@/components/ui/gallery6";
import { Shield, Building2, Github } from "lucide-react";
import { useMatch } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import { format } from "date-fns";
import volksbegehren from "@/data/volksbegehren.json";
const Index = () => {
  const initiativeMatch = useMatch("/initiative/:id");
  const referendumMatch = useMatch("/referendum/:id");
  const volksbegehrenMatch = useMatch("/volksbegehren/:id");
  const {
    data: healthStatus,
    isLoading: healthLoading,
    isError: healthError
  } = useHealthStatus();
  // Normalisieren der Volksbegehren-Daten und Ableitung von id/slug
  const normalized = (volksbegehren as any[]).map((item, idx) => {
    const title: string = item?.title ?? "";
    const slug = title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = slug || String(idx + 1);
    const type = String(item?.type ?? "").toLowerCase() === "referendum" ? "Referendum" : "Initiative";
    return {
      id,
      slug,
      type,
      title,
      startDate: item?.start_date ?? "",
      endDate: item?.end_date ?? "",
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
  const preselect: { type: "Initiative" | "Referendum"; id: string } | undefined = volksbegehrenMatch ? {
    type: (normalized.find(i => i.id === volksbegehrenMatch.params.id || i.slug === volksbegehrenMatch.params.id)?.type || "Initiative") as "Initiative" | "Referendum",
    id: resolveId(normalized as any[], volksbegehrenMatch.params.id as string) || (volksbegehrenMatch.params.id as string)
  } : initiativeMatch ? {
    type: "Initiative",
    id: resolveId(normalized.filter(i => i.type === "Initiative"), initiativeMatch.params.id as string) || (initiativeMatch.params.id as string)
  } : referendumMatch ? {
    type: "Referendum",
    id: resolveId(normalized.filter(i => i.type === "Referendum"), referendumMatch.params.id as string) || (referendumMatch.params.id as string)
  } : undefined;

  // Prepare data for carousel
  const carouselItems = normalized.map((item: any) => {
    const dateRange = getDateRange(item.startDate, item.endDate);
    return {
      id: item.id,
      title: item.title,
      summary: `${item.type}: ${item.title.substring(0, 120)}...`,
      dateRange: dateRange,
      url: `/volksbegehren/${item.slug}`,
      image: "/placeholder.svg",
      slug: item.slug,
      type: item.type as "Initiative" | "Referendum",
      pdf: item.pdf
    };
  });
  return <body className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Skip to main content - Swiss Design System requirement */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>

      {/* Header following Swiss Design System structure */}
      <header id="main-header">
        {/* Top Bar - All Swiss Federal Authorities */}
        <div className="top-bar text-white border-b border-white/20" style={{
        backgroundColor: 'hsl(var(--footer-background))'
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
              <div className="flex items-center gap-4">
                {/* Swiss Cross Logo Placeholder */}
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                  <img src="/ddhlogo/logo blue.png" alt="E-Collecting Pilot Logo" className="w-12 h-12" />
                </div>
                <div className="max-w-md">
                  <h1 className="text-base font-medium text-[hsl(var(--gov-nav-text))] leading-tight">E-Collecting Pilotprojekt</h1>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <nav className="meta-navigation hidden lg:flex items-center gap-4 text-sm">
                  <a href="https://winterkongress.ch/2025/talks/pilotprojekt_e_collecting_how_low_can_we_go/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors">How low can we go?</a>
                  <a href="#" className="text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors">Referenzarchitektur (in Arbeit)</a>
                </nav>
                <div className="flex items-center gap-4">
                  
                  {/* External Links Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors">
                      <span className="text-sm">Externe Links</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/volksinitiativen.html" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          Volksinitiativen (admin.ch)
                        </a>
                        <a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/referenden.html" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          Referenden (admin.ch)
                        </a>
                        <a href="https://www.eid.admin.ch/de" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          Swiyu-Wallet App
                        </a>
                        <a href="https://www.bcs.admin.ch/bcs-web/#/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          Beta-ID Service
                        </a>
                      </div>
                    </div>
                  </div>
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
                <h3 className="text-lg font-semibold text-foreground">Pilotprojekt</h3>
                  <p className="text-sm text-muted-foreground">
                    Hierbei handelt es sich um ein fiktives Pilotprojekt für das elektronische Sammeln von Willensbekundungen für Volksbegehren. 
                  </p>
                  <p className="text-sm text-muted-foreground">
                   Alle Inhalte und Funktionen dieser Seite inklusive Services sind nur für Demonstrationszwecke gedacht.
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">Beta-Hinweis</h3>
                  <p className="text-sm text-muted-foreground">
                    Dieser Pilot verwendet den Beta Credential Service des Bundes. Um den Pilot zu nutzen, muss eine Beta-ID über die Swiyu-Wallet App erstellt werden.
                  </p>
                  <a href="https://www.bcs.admin.ch/bcs-web/#/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:text-primary/80 underline underline-offset-4">
                    Beta-ID ausstellen
                  </a>

                  <h3 className="text-lg font-semibold text-foreground">Initiativen und Referenden</h3>
                  <p className="text-sm text-muted-foreground">
                  Dieser Pilot verwendet zufällig generierte Initiativen und Referenden. Offizielle Initiativen und Referenden finden Sie auf der Webseite des Bundes: (<a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/referenden.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-4">Referenden</a> / <a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/volksinitiativen.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-4">Volksinitiativen</a>).
                  </p>
                </div>
              </div>
            </div>
            <VerificationDashboard />
          </div>
        </section>

        {/* Full width section */}
        <section className="border-t">
          <Gallery6 heading="Verfügbare Initiativen und Referenden" items={carouselItems} />
        </section>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="text-white" style={{
      backgroundColor: 'hsl(var(--footer-background))'
    }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Über E-Collecting Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Über E-Collecting</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Das elektronische Sammeln von Unterschriften (E-Collecting) ermöglicht es Bürgerinnen und Bürgern, digitale Unterschriften für Volksinitiativen und Referenden zu leisten. Dieser Pilot testet die technische Umsetzung und Sicherheit des elektronischen Sammelverfahrens für politische Rechte in der Schweiz. Hier finden Sie wichtige Informationen zum Pilotprojekt.
              </p>
              <p className="text-sm text-white/70 mt-6">
                © 2025 ein Projekt von <a href="https://www.digitaldemocracyhub.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4">Digital Democracy Hub Schweiz</a> in Kooperation mit <a href="https://www.demokratie.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4">Stiftung für Direkte Demokratie</a>
              </p>
            </div>

            {/* Bleiben Sie informiert Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Bleiben Sie informiert</h3>
              <div className="space-y-3">
                <a href="https://klick.typeform.com/to/UfS9J1AL" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/30 text-white text-sm rounded hover:bg-white/10 transition-colors">
                  Newsletter abonnieren
                  <span>→</span>
                </a>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <h4 className="text-base font-medium mb-3">Kontakt</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <p>Digital Democracy Hub Schweiz</p>
                  
                  <p>E-Mail: info@digitaldemocracyhub.ch</p>
                  <p>Web: www.digitaldemocracyhub.ch</p>
                </div>
              </div>
            </div>

            {/* Weitere Informationen Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Verifier-Mgmt:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${healthStatus?.verifierManagement?.status === "UP" ? "text-green-400" : "text-red-400"}`}>
                      {healthStatus?.verifierManagement?.status || "Offline"}
                    </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Issuer-Mgmt:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${healthStatus?.issuerManagement?.status === "UP" ? "text-green-400" : "text-red-400"}`}>
                      {healthStatus?.issuerManagement?.status || "Offline"}
                    </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Issuer-OID4VCI:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${healthStatus?.issuerOid4vci?.status === "UP" ? "text-green-400" : "text-red-400"}`}>
                      {healthStatus?.issuerOid4vci?.status || "Offline"}
                    </span>}
                </div>
              </div>
            </div>
          </div>

          {/* GitHub info */}
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="flex items-center justify-start gap-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                made with ❤️{" "}
                <a href="https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="GitHub Repository">
                  <Github size={16} />
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </body>;
};
export default Index;