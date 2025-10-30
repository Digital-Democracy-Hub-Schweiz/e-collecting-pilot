import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useHealthStatus } from "@/hooks/use-health-status";
import PageContainer from "@/components/PageContainer";
import { Share2, Printer } from "lucide-react";
import { useCurrentLanguage } from "@/utils/routing";
import { useTranslation } from "react-i18next";
import { GemeindeCredentialIssuer } from "@/components/GemeindeCredentialIssuer";

const EIdCredentialFlow = () => {
  const { t } = useTranslation(['common', 'content']);
  const { data: healthStatus, isLoading: healthLoading } = useHealthStatus();
  const currentLang = useCurrentLanguage();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = document.title || t('common:share');
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert(t('common:copy') + ' ' + url);
      } else {
        window.prompt(t('common:copy') + ':', url);
      }
    } catch (_err) {
      // ignore share errors
    }
  };
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Skip to main content - Swiss Design System requirement */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      <main id="main-content">
        {/* Breadcrumb Section */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">{t('common:breadcrumb.home')}</a> 
              <span className="inline-block mx-[7px]">›</span> 
              <span>{t('content:gemeinde.breadcrumb', 'Gemeinde E-ID Flow')}</span>
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section */}
        <section className="bg-white">
          <PageContainer className="h-[52px] flex items-center justify-end gap-3">
            <button type="button" aria-label={t('common:share')} onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Share2 className="w-5 h-5" aria-hidden />
            </button>
            <button type="button" aria-label={t('common:print')} onClick={handlePrint} className="w-10 h-10 flex items-center justify-center text-[#1f2937] p-0 leading-none">
              <Printer className="w-5 h-5" aria-hidden />
            </button>
          </PageContainer>
        </section>

        {/* Hero Section */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-14 md:py-16 flex flex-col items-start">
              <h1 className="sd-h1 max-w-[1024px]">
                {t('content:gemeinde.hero.title', 'Stimmregister-Nachweis für anonyme Willensbekundungen')}
              </h1>
              <div className="h-6 md:h-10" />
              <p className="sd-lead max-w-[1024px]">
                {t('content:gemeinde.hero.description', 'Weisen Sie Ihre Stimmberechtigung nach und erhalten Sie einen digitalen Stimmrechtsausweis als Credential. Damit können Sie später fälschungssicher, anonym und nur einmal pro Volksbegehren Ihre Willensbekundung abgeben – ohne dass Ihre Identität preisgegeben wird.')}
              </p>
            </div>
            <div className="h-24 opacity-0" />
          </PageContainer>
        </section>

        {/* Formular-Sektion */}
        <section className="bg-[#f1f4f7] sd-section-py-comfort">
          <GemeindeCredentialIssuer />
        </section>
      </main>

      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </div>
  );
};

export default EIdCredentialFlow;