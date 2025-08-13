import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Shield, Building2 } from "lucide-react";
import { useMatch } from "react-router-dom";
const Index = () => {
  const initiativeMatch = useMatch("/initiative/:id");
  const referendumMatch = useMatch("/referendum/:id");
  const preselect = initiativeMatch
    ? { type: "Initiative" as const, id: initiativeMatch.params.id as string }
    : referendumMatch
    ? { type: "Referendum" as const, id: referendumMatch.params.id as string }
    : undefined;
  return <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-background border-b shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">E-Collecting Pilot</h1>
                <p className="text-muted-foreground">Versuchsbetrieb für die elektronische Unterstützung von Volksbegehren</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <ReceiptCredentialIssuer preselect={preselect} />
          <VerificationDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-warning-foreground font-medium">
                ⚠️ Dies ist ein nicht-produktiver Prototyp
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              © Digital Democracy Hub Schweiz - Fachstelle für Demokratie und Digitalisierung 2025
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;