import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useHealthStatus } from "@/hooks/use-health-status";
import { useTranslation } from "react-i18next";
import { Share2, Printer } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useCurrentLanguage } from "@/utils/routing";

const Projekt = () => {
  const { t } = useTranslation(['common', 'content']);
  const { data: healthStatus, isLoading: healthLoading } = useHealthStatus();
  const currentLang = useCurrentLanguage();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = document.title || 'Teilen';
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link kopiert.');
      } else {
        window.prompt('Link kopieren:', url);
      }
    } catch (_) {}
  };
  const handlePrint = () => window.print();

  return (
    <body className="min-h-screen bg-white flex flex-col">
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb (Figma) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">Startseite</a> <span className="inline-block mx-[7px]">›</span> Projekt
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section (Figma) */}
        <section className="bg-white">
          <PageContainer className="h-[52px] flex items-center justify-end gap-3">
            <button type="button" aria-label="Teilen" onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Share2 className="w-5 h-5" aria-hidden />
            </button>
            <button type="button" aria-label="Drucken" onClick={handlePrint} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Printer className="w-5 h-5" aria-hidden />
            </button>
          </PageContainer>
        </section>

        {/* Hero-ähnlicher Titelblock (Figma Detailseite) */}
        <section className="bg-white">
          <div className="box-border w-full px-[452px]">
            <div className="h-14 opacity-0" />
            <div className="w-full">
              <h1 className="text-[40px] leading-[48px] font-semibold text-[#1f2937]">E-Collecting Pilotprojekt</h1>
            </div>
            <div className="h-10 opacity-0" />
            <div className="w-full">
              <p className="text-[22px] leading-[33px] font-medium text-[#1f2937] max-w-[1200px]">
                Diese Website ist ein gemeinnütziges Projekt der Zivilgesellschaft. Unser Ziel ist es, Initiativen und Referenden mithilfe der neuen E-ID sicher, digital und barrierefrei zu unterstützen.
              </p>
            </div>
            <div className="h-24 opacity-0" />
          </div>
        </section>

        {/* Detail-Content (Figma Detailseite) */}
        <section className="bg-white">
          <div className="box-border w-full px-[452px]">
            <div className="w-[805px] max-w-full">
              <div className="max-w-none">
                <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">Informationen zur Teilnahme</h2>
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">e-ID</h3>
                <p>Die e-ID wird vom Staat herausgegeben. Sie ergänzt die physische Identitätskarte und ist kostenlos. Am 28. September stimmt die Bevölkerung über die Vorlage ab.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">swiyu-Wallet App</h3>
                <p>Dieses Pilotprojekt verwendet den Beta Credential Service des Bundes. Für die Teilnahme muss eine Beta-ID über die swiyu-Wallet App erstellt werden. Im Rahmen des Projekts werden ausschliesslich fiktive Vorlagen und die Beta-ID des Bundes genutzt. Es werden keine persönlichen Daten gespeichert.</p>

                <div className="mt-6 space-y-2">
                  <a href="https://apps.apple.com/ch/app/swiyu/id6737259614" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">📱 swiyu App (iOS)</a>
                  <a href="https://play.google.com/store/apps/details?id=ch.admin.foitt.swiyu&pli=1" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">🤖 swiyu App (Android)</a>
                  <a href="https://www.bcs.admin.ch/bcs-web/" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">👉 Beta-ID ausstellen</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Spacer vor Footer (Figma: 96px) */}
      <section className="bg-white">
        <PageContainer paddingYClassName="py-24" />
      </section>

      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </body>
  );
};

export default Projekt;


