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
    </div>;
};
export default Index;