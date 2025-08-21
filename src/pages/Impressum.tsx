const Impressum = () => {
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
              <div className="flex items-center gap-4">
                {/* Swiss Cross Logo Placeholder */}
                <div className="h-12 bg-white flex items-center justify-center">
                  <img src="/ddhlogo/logo blue.png" alt="E-Collecting Pilot Logo" className="h-12" />
                </div>
                <div className="max-w-md">
                  <h1 className="text-base font-medium text-[hsl(var(--gov-nav-text))] leading-tight">E-Collecting Pilotprojekt</h1>
                </div>
              </div>
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
                  <p><strong>Digital Democracy Hub Schweiz</strong></p>
                  <p>E-Mail: info@digitaldemocracyhub.ch</p>
                  <p>Web: www.digitaldemocracyhub.ch</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Kooperationspartner</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Stiftung für Direkte Demokratie</strong></p>
                  <p>Web: www.demokratie.ch</p>
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
                  Dieses Pilotprojekt verwendet den Beta Credential Service des Bundes. Personenbezogene Daten werden 
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-white/70">
              © 2025 ein Projekt von{" "}
              <a href="https://www.digitaldemocracyhub.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4">
                Digital Democracy Hub Schweiz
              </a>
              {" "}in Kooperation mit{" "}
              <a href="https://www.demokratie.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4">
                Stiftung für Direkte Demokratie
              </a>
            </p>
          </div>
        </div>
      </footer>
    </body>
  );
};

export default Impressum;