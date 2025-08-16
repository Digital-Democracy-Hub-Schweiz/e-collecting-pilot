import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ReceiptCredentialIssuer } from "@/components/ReceiptCredentialIssuer";
import { Gallery6 } from "@/components/ui/gallery6";
import { Shield, Building2, Github, CheckCircle, Smartphone, Lock, Users, ArrowRight } from "lucide-react";
import { useMatch } from "react-router-dom";
import { useHealthStatus } from "@/hooks/use-health-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      image: "/placeholder.svg",
      slug: item.slug,
      type: "Initiative" as const,
    })),
    ...referendums.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: `Referendum: ${item.title.substring(0, 120)}...`,
      url: `/referendum/${item.slug}`,
      image: "/placeholder.svg",
      slug: item.slug,
      type: "Referendum" as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background border-b shadow-card relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">E-Collecting</h1>
                <p className="text-sm text-muted-foreground">Digitale Identitätskarte für Volksinitiativen</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#funktionen" className="text-muted-foreground hover:text-primary transition-colors">Funktionen</a>
              <a href="#sicherheit" className="text-muted-foreground hover:text-primary transition-colors">Sicherheit</a>
              <a href="#pilot" className="text-muted-foreground hover:text-primary transition-colors">Pilot</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Die e-ID funktioniert wie eine{" "}
                <span className="text-white/90">digitale Identitätskarte</span>
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Das e-ID wird als digitale Identitätskarte zur verfügung gestellt. 
                Mit der e-ID können Sie sich sicher und einfach bei Online-Diensten anmelden 
                und Ihre Identität bestätigen, ohne Ihre physische Identitätskarte vorzeigen zu müssen.
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  Pilot jetzt testen
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Mehr erfahren
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <Smartphone className="w-24 h-24 text-white mx-auto mb-4" />
                  <div className="text-center">
                    <div className="text-sm text-white/80 mb-2">e-ID Wallet</div>
                    <div className="text-xs text-white/60">Sicher · Einfach · Vertrauenswürdig</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funktionen" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Wie nutze ich die e-ID?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-card">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">e-ID Wallet herunterladen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Laden Sie die e-ID Wallet App herunter und erstellen Sie Ihre digitale Identität 
                  mit wenigen Klicks.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-card">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Identität verifizieren</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verifizieren Sie Ihre Identität einmalig und nutzen Sie diese für 
                  alle zukünftigen Anmeldungen.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-card">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Sicher anmelden</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Melden Sie sich sicher bei Online-Diensten an, ohne jedes Mal 
                  Ihre persönlichen Daten eingeben zu müssen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="sicherheit" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Was passiert mit meinen Daten?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Vollständige Kontrolle</h3>
                    <p className="text-muted-foreground">Sie behalten die volle Kontrolle über Ihre Daten und entscheiden selbst, wann und mit wem Sie diese teilen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Höchste Sicherheit</h3>
                    <p className="text-muted-foreground">Alle Daten werden verschlüsselt und nach höchsten Sicherheitsstandards geschützt.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Transparenz</h3>
                    <p className="text-muted-foreground">Sie sehen jederzeit, welche Daten Sie geteilt haben und können diese Berechtigung widerrufen.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-card shadow-elegant rounded-2xl p-8 border">
                <Shield className="w-20 h-20 text-primary mx-auto mb-6" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Swiss Trust</h3>
                  <p className="text-muted-foreground">Entwickelt nach Schweizer Datenschutzstandards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Section */}
      <section id="pilot" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pilot-Betrieb: E-Collecting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Testen Sie die e-ID in unserem Pilotprojekt für elektronische Unterschriftensammlung 
              bei Volksinitiativen und Referenden.
            </p>
          </div>
          
          {/* Receipt Credential Issuer with Info Box */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <ReceiptCredentialIssuer preselect={preselect} />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-muted/30 border border-muted rounded-lg p-6 space-y-4 h-fit">
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
      </section>

      {/* News Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              News: Abstimmung zum Referendum am 28.09.2025
            </h2>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Das Referendum gegen das E-ID-Gesetz hat genügend gültige Unterschriften gesammelt und wird dem Schweizer Volk zur Abstimmung vorgelegt. Die Abstimmung findet am 28. September 2025 statt.
              </p>
              <div className="space-y-4">
                <h3 className="font-semibold">Was steht zur Abstimmung?</h3>
                <p className="text-muted-foreground">
                  Das neue E-ID-Gesetz regelt die Ausgabe und Verwendung einer staatlichen elektronischen Identität. Die E-ID soll als digitaler Ausweis fungieren und sowohl für private als auch staatliche Online-Dienste verwendet werden können.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <ArrowRight className="w-4 h-4" />
                  <a href="#" className="text-primary hover:text-primary/80 underline underline-offset-4">
                    Mehr zur Abstimmung
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Initiatives and Referendums Carousel */}
      <div className="border-t">
        <Gallery6 
          heading="Verfügbare Initiativen und Referenden"
          items={carouselItems}
        />
      </div>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Über die e-ID</h3>
              <p className="text-sm text-muted-foreground">
                Die elektronische Identität (e-ID) ist ein digitaler Ausweis, der es Ihnen ermöglicht, sich sicher und einfach online zu identifizieren.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Häufig gestellte Fragen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Wie sicher ist die e-ID?</a></li>
                <li><a href="#" className="hover:text-primary">Wo kann ich die e-ID nutzen?</a></li>
                <li><a href="#" className="hover:text-primary">Was kostet die e-ID?</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Weitere Informationen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Datenschutz</a></li>
                <li><a href="#" className="hover:text-primary">Impressum</a></li>
                <li><a href="#" className="hover:text-primary">Kontakt</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Verifier-Mgmt:</span>
                  {healthLoading ? (
                    <span className="text-sm text-muted-foreground">Lädt...</span>
                  ) : (
                    <span className={`text-sm font-medium ${
                      healthStatus?.verifierManagement?.status === "UP" ? "text-green-600" : "text-destructive"
                    }`}>
                      {healthStatus?.verifierManagement?.status || "Offline"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Issuer-Mgmt:</span>
                  {healthLoading ? (
                    <span className="text-sm text-muted-foreground">Lädt...</span>
                  ) : (
                    <span className={`text-sm font-medium ${
                      healthStatus?.issuerManagement?.status === "UP" ? "text-green-600" : "text-destructive"
                    }`}>
                      {healthStatus?.issuerManagement?.status || "Offline"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
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
        </div>
      </footer>
    </div>
  );
};

export default Index;