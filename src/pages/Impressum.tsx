import { useHealthStatus } from "@/hooks/use-health-status";

const Impressum = () => {
  const { data: healthStatus, isLoading: healthLoading } = useHealthStatus();

  const getStatusColor = (serviceHealth: any) => {
    if (!serviceHealth) return "text-red-400";
    return serviceHealth.status === "UP" ? "text-green-400" : "text-red-400";
  };

  return (
    <body className="min-h-screen bg-gradient-secondary flex flex-col">
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
              <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                {/* Swiss Cross Logo */}
                <div className="h-12 bg-white flex items-center justify-center">
                  <img src="/ddhlogo/logo blue.png" alt="E-Collecting Pilot Logo" className="h-12" />
                </div>
                {/* Beta Logo */}
                <div className="flex items-center">
                  <img src="/lovable-uploads/e75dd54e-b28f-48bc-8d17-683d07664c09.png" alt="Beta" className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                  <h1 className="text-base font-medium text-[hsl(var(--gov-nav-text))] leading-tight">E-Collecting Pilotprojekt</h1>
                </div>
              </a>
              <div className="flex items-center gap-6">
                <nav className="meta-navigation hidden lg:flex items-center gap-4 text-sm">
                  <a href="/" className="text-[hsl(var(--gov-nav-text))] hover:text-primary transition-colors">Zurück zur Hauptseite</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Impressum</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg border border-muted p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Verantwortlich für den Inhalt</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Verein Digital Democracy Hub Schweiz - Fachstelle für Demokratie und Digitalisierung (in Gründung)</strong></p>
                  <p>E-Mail: info@digitaldemocracyhub.ch</p>
                  <p>Web: https://digitaldemocracyhub.ch</p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Zweck der Plattform</h2>
                <p className="text-muted-foreground">
                  Diese Plattform ist ein fiktives Pilotprojekt für das elektronische Sammeln von Willensbekundungen 
                  für Volksbegehren. Alle Inhalte und Funktionen dieser Seite inklusive Services sind nur für 
                  Demonstrationszwecke gedacht und haben keine rechtliche Gültigkeit.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Haftungsausschluss</h2>
                <p className="text-muted-foreground">
                  Die Betreiber dieser Website übernehmen keine Gewähr für die Vollständigkeit, Richtigkeit und 
                  Aktualität der bereitgestellten Informationen. Haftungsansprüche gegen die Betreiber, die sich 
                  auf Schäden materieller oder ideeller Art beziehen, welche durch die Nutzung oder Nichtnutzung 
                  der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger 
                  Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Datenschutz</h2>
                <p className="text-muted-foreground">
                  Dieses Pilotprojekt verwendet den Beta Credential Service des Bundes. Daten werden 
                  nur im Rahmen der technischen Demonstration verarbeitet und nicht zu anderen Zwecken verwendet. 
                  Für die Erstellung einer Beta-ID gelten die Datenschutzbestimmungen des entsprechenden Services.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Urheberrecht</h2>
                <p className="text-muted-foreground">
                  Alle Inhalte dieser Website, soweit sie nicht von Dritten bereitgestellt wurden, unterliegen dem 
                  schweizerischen Urheberrecht. Jede Verwertung ohne Zustimmung der Betreiber ist unzulässig.
                </p>
              </div>
            </div>
          </div>
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
                Das elektronische Sammeln von Unterschriften (E-Collecting) ermöglicht es den Stimmbürgerinnen und -Bürgern, digitale Willensbekundungen für Volksinitiativen und Referenden zu leisten. Dieser Pilot testet eine mögliche Umsetzung mittels der kommenden E-ID des Bundes.
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

            {/* System Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Verifier-Mgmt:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${getStatusColor(healthStatus?.verifierManagement)}`}>
                    {healthStatus?.verifierManagement?.status || "Offline"}
                  </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Issuer-Mgmt:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${getStatusColor(healthStatus?.issuerManagement)}`}>
                    {healthStatus?.issuerManagement?.status || "Offline"}
                  </span>}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
                  <span className="text-white/70">Issuer-OID4VCI:</span>
                  {healthLoading ? <span className="text-white/70">Lädt...</span> : <span className={`font-medium ${getStatusColor(healthStatus?.issuerOid4vci)}`}>
                    {healthStatus?.issuerOid4vci?.status || "Offline"}
                  </span>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70 flex items-center gap-2">
                made with ❤️{" "}
                <a href="https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="GitHub Repository">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </p>
              <a href="/impressum" className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4">
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </body>
  );
};

export default Impressum;