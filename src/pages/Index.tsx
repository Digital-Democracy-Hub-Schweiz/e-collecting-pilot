import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Gallery6 } from "@/components/ui/gallery6";
import { Shield, Building2, Github } from "lucide-react";
import { useMatch } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import initiatives from "@/data/initiatives.json";
import referendums from "@/data/referendums.json";
const Index = () => {
  const initiativeMatch = useMatch("/initiative/:id");
  const referendumMatch = useMatch("/referendum/:id");
  const { data: healthStatus, isLoading: healthLoading, isError: healthError } = useHealthStatus();
  const resolveId = (list: any[], value?: string) => {
    if (!value) return undefined;
    const found = list.find((item) => item?.id === value || item?.slug === value);
    return found?.id;
  };

  const preselect = initiativeMatch
    ? {
        type: "Initiative" as const,
        id: (resolveId(initiatives as any[], initiativeMatch.params.id as string) || (initiativeMatch.params.id as string)),
      }
    : referendumMatch
    ? {
        type: "Referendum" as const,
        id: (resolveId(referendums as any[], referendumMatch.params.id as string) || (referendumMatch.params.id as string)),
      }
    : undefined;

  // Prepare data for carousel
  const carouselItems = [
    ...initiatives.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: `Initiative: ${item.title.substring(0, 120)}...`,
      url: `/initiative/${item.slug}`,
      image: "/placeholder.svg", // Using placeholder image
      slug: item.slug,
      type: "Initiative" as const,
    })),
    ...referendums.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: `Referendum: ${item.title.substring(0, 120)}...`,
      url: `/referendum/${item.slug}`,
      image: "/placeholder.svg", // Using placeholder image
      slug: item.slug,
      type: "Referendum" as const,
    })),
  ];
  return <div className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Header */}
      <header className="bg-[hsl(var(--gov-header-bg))] text-[hsl(var(--gov-header-text))]">
        {/* Top government bar */}
        <div className="border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select className="bg-transparent text-[hsl(var(--gov-header-text))] text-sm border-none outline-none">
                  <option>Alle Schweizer Bundesbehörden</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-[hsl(var(--gov-header-text))] text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors">
                  DE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Swiss Cross Logo Placeholder */}
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                  <path d="M12 2v8H4v4h8v8h4v-8h8V10h-8V2h-4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-medium text-[hsl(var(--gov-header-text))]">
                  Elektronische Identität und Vertrauensinfrastruktur
                </h1>
                <p className="text-sm text-[hsl(var(--gov-header-text-muted))]">
                  E-Collecting Pilot - Versuchsbetrieb für die elektronische Unterstützung von Volksbegehren
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-[hsl(var(--gov-header-text))] hover:text-[hsl(var(--gov-header-text))]/80 transition-colors">
                  Blog
                </a>
                <a href="#" className="text-sm text-[hsl(var(--gov-header-text))] hover:text-[hsl(var(--gov-header-text))]/80 transition-colors">
                  Hilfe & FAQ
                </a>
                <a href="#" className="text-sm text-[hsl(var(--gov-header-text))] hover:text-[hsl(var(--gov-header-text))]/80 transition-colors">
                  Über uns
                </a>
                <div className="relative">
                  <button className="text-sm text-[hsl(var(--gov-header-text))] hover:text-[hsl(var(--gov-header-text))]/80 transition-colors flex items-center gap-1">
                    Mehr
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 8L2 4h8l-4 4z"/>
                    </svg>
                  </button>
                </div>
              </nav>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="bg-[hsl(var(--gov-nav-bg))] border-t border-gray-200">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-8 py-3">
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] font-medium border-b-2 border-primary pb-3">
                Startseite
              </a>
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors pb-3">
                e-ID
              </a>
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors pb-3">
                Public Beta
              </a>
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors pb-3">
                Elektronischer Lernfahrausweis
              </a>
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors pb-3">
                Technologie
              </a>
              <a href="#" className="text-sm text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors pb-3">
                Partizipation
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid gap-8">
          {/* Receipt Credential Issuer with Info Box */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReceiptCredentialIssuer preselect={preselect} />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-muted/30 border border-muted rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Beta-Hinweis</h3>
                <p className="text-sm text-muted-foreground">
                  Dieser Pilot verwendet den Beta Credential Service des Bundes. Um den Pilot zu nutzen, muss eine Beta-ID über die Swiyu-Wallet App erstellt werden.
                </p>
                <a 
                  href="https://www.bcs.admin.ch/bcs-web/#/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  Beta-ID ausstellen
                </a>
                <p className="text-sm text-muted-foreground">
                 Alle Inhalte und Funktionen dieser Seite inklusive Services sind nur für Demonstrationszwecke gedacht.
                </p>
                <h3 className="text-lg font-semibold text-foreground">Initiativen und Referenden</h3>
                <p className="text-sm text-muted-foreground">
                Dieser Pilot verwendet die Initiativen und Referenden aus der Datenbank des Bundes und können unter umständen nicht vollständig oder aktuell sein.
                Weitere Inforamtionen zu laufenden Referenden und Initiativen finden Sie auf der Webseite des Bundes (<a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/referenden.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-4">Referenden</a> und <a href="https://www.bk.admin.ch/bk/de/home/politische-rechte/volksinitiativen.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-4">Volksinitiativen</a>).
                </p>
              </div>
            </div>
          </div>
          <VerificationDashboard />
        </div>
      </main>

      {/* Initiatives and Referendums Carousel */}
      <div className="border-t">
        <Gallery6 
          heading="Verfügbare Initiativen und Referenden"
          items={carouselItems}
        />
      </div>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-background))] text-[hsl(var(--footer-text))]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Über E-Collecting Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Über E-Collecting</h3>
              <p className="text-sm text-[hsl(var(--footer-text-muted))] leading-relaxed">
                Das elektronische Sammeln von Unterschriften (E-Collecting) ermöglicht es Bürgerinnen und 
                Bürgern, digitale Unterschriften für Volksinitiativen und Referenden zu leisten. Dieser Pilot 
                testet die technische Umsetzung und Sicherheit des elektronischen Sammelverfahrens für 
                politische Rechte in der Schweiz. Hier finden Sie wichtige Informationen zum Pilotprojekt.
              </p>
              <p className="text-sm text-[hsl(var(--footer-text-muted))] mt-6">
                © 2025 Digital Democracy Hub Schweiz
              </p>
            </div>

            {/* Bleiben Sie informiert Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Bleiben Sie informiert</h3>
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="flex items-center text-sm text-[hsl(var(--footer-text-muted))] hover:text-[hsl(var(--footer-text))] transition-colors"
                >
                  📺 Youtube
                </a>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[hsl(var(--footer-text-muted))] text-[hsl(var(--footer-text))] text-sm rounded hover:bg-[hsl(var(--footer-text))]/10 transition-colors">
                  Newsletter abonnieren
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Weitere Informationen Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-[hsl(var(--footer-text-muted))]/20 pb-2">
                  <span className="text-[hsl(var(--footer-text-muted))]">Verifier-Mgmt:</span>
                  {healthLoading ? (
                    <span className="text-[hsl(var(--footer-text-muted))]">Lädt...</span>
                  ) : (
                    <span className={`font-medium ${
                      healthStatus?.verifierManagement?.status === "UP" ? "text-green-400" : "text-red-400"
                    }`}>
                      {healthStatus?.verifierManagement?.status || "Offline"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-[hsl(var(--footer-text-muted))]/20 pb-2">
                  <span className="text-[hsl(var(--footer-text-muted))]">Issuer-Mgmt:</span>
                  {healthLoading ? (
                    <span className="text-[hsl(var(--footer-text-muted))]">Lädt...</span>
                  ) : (
                    <span className={`font-medium ${
                      healthStatus?.issuerManagement?.status === "UP" ? "text-green-400" : "text-red-400"
                    }`}>
                      {healthStatus?.issuerManagement?.status || "Offline"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-[hsl(var(--footer-text-muted))]/20 pb-2">
                  <span className="text-[hsl(var(--footer-text-muted))]">Issuer-OID4VCI:</span>
                  {healthLoading ? (
                    <span className="text-[hsl(var(--footer-text-muted))]">Lädt...</span>
                  ) : (
                    <span className={`font-medium ${
                      healthStatus?.issuerOid4vci?.status === "UP" ? "text-green-400" : "text-red-400"
                    }`}>
                      {healthStatus?.issuerOid4vci?.status || "Offline"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* GitHub info */}
          <div className="border-t border-[hsl(var(--footer-text-muted))]/20 mt-8 pt-8">
            <div className="flex items-center justify-start gap-2">
              <p className="text-sm text-[hsl(var(--footer-text-muted))] flex items-center gap-2">
                made with ❤️{" "}
                <a 
                  href="https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--footer-text-muted))] hover:text-[hsl(var(--footer-text))] transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github size={16} />
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;