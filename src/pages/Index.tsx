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
      <header className="bg-background border-b shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">E-Collecting Pilot</h1>
                <p className="text-muted-foreground">🚀 Versuchsbetrieb für die elektronische Unterstützung von Volksbegehren</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              
              
            </div>
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