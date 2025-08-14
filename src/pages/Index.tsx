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
      type: "Initiative" as const,
    })),
    ...referendums.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: `Referendum: ${item.title.substring(0, 120)}...`,
      url: `/referendum/${item.slug}`,
      image: "/placeholder.svg", // Using placeholder image
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
                  Beta E-ID ausstellen
                </a>
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
      <footer className="bg-background border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Verifier:</span>
                {healthLoading ? (
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                ) : (
                  <span className={`text-sm font-medium ${
                    healthStatus?.verifier?.status === "UP" ? "text-green-600" : "text-destructive"
                  }`}>
                    {healthStatus?.verifier?.status || "Offline"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Issuer:</span>
                {healthLoading ? (
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                ) : (
                  <span className={`text-sm font-medium ${
                    healthStatus?.issuer?.status === "UP" ? "text-green-600" : "text-destructive"
                  }`}>
                    {healthStatus?.issuer?.status || "Offline"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <a 
                href="https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub Repository"
              >
                <Github size={20} />
              </a>
              <p className="text-sm text-muted-foreground">
                made with ❤️ by{" "}
                <a 
                  href="https://www.digitaldemocracyhub.ch/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  Digital Democracy Hub Schweiz
                </a>{" "}
                © 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;