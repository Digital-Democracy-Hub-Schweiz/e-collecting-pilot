import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Shield, Building2 } from "lucide-react";
import { useMatch } from "react-router-dom";
const Index = () => {
  const initiativeMatch = useMatch("/initiative/:id");
  const referendumMatch = useMatch("/referendum/:id");
  const preselect = initiativeMatch ? {
    type: "Initiative" as const,
    id: initiativeMatch.params.id as string
  } : referendumMatch ? {
    type: "Referendum" as const,
    id: referendumMatch.params.id as string
  } : undefined;
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
          <ReceiptCredentialIssuer preselect={preselect} />
          <VerificationDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="bg-muted/30 border border-muted rounded-lg p-4 max-w-3xl mx-auto space-y-3">
              <p className="text-sm text-muted-foreground">
                Dieser Pilot verwendet den Beta Credential Service des Bundes. Um den Pilot zu nutzen, muss eine Beta-ID über die Swiyu-App erstellt werden.
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
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                made with ❤️ by{" "}
                <a 
                  href="https://www.digitaldemocracyhub.ch/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  Digital Democracy Hub Schweiz
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                © Digital Democracy Hub Schweiz - Fachstelle für Demokratie und Digitalisierung 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;