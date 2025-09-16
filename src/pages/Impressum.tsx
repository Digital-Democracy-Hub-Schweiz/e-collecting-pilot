import { useHealthStatus } from "@/hooks/use-health-status";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from 'react-i18next';
import PageContainer from "@/components/PageContainer";
import { Share2, Printer } from "lucide-react";
import { useCurrentLanguage } from "@/utils/routing";

const Impressum = () => {
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
    } catch (_) {}
  };
  const handlePrint = () => window.print();

  return (
    <body className="min-h-screen bg-white flex flex-col">
      {/* Skip to main content - Swiss Design System requirement */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* Breadcrumb (Figma) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">{t('common:breadcrumb.home')}</a> <span className="inline-block mx-[7px]">›</span> {t('common:breadcrumb.impressum')}
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section (Figma) */}
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

        {/* Hero-ähnlicher Titelblock (wie Projektseite) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-14 md:py-16 flex flex-col items-start">
              <h1 className="text-[28px] leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937] max-w-[1024px]">{t('content:impressum.title')}</h1>
              <div className="h-12 md:h-24" />
            </div>
          </PageContainer>
        </section>

        {/* Detail-Content Block im Stil der Projektseite */}
        <section className="bg-white">
          <PageContainer>
            <div className="w-full max-w-[805px]">
              <div className="max-w-none">
                <div className="bg-white rounded-sm p-0 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{t('content:impressum.responsible.title')}</h2>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong>{t('content:impressum.responsible.organization')}</strong></p>
                      <p>{t('content:impressum.responsible.contact')}</p>
                      <p>{t('content:impressum.responsible.email')}</p>
                      <p>{t('content:impressum.responsible.web')}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{t('content:impressum.purpose.title')}</h2>
                    <p className="text-muted-foreground">{t('content:impressum.purpose.description')}</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{t('content:impressum.disclaimer.title')}</h2>
                    <p className="text-muted-foreground">{t('content:impressum.disclaimer.description')}</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{t('content:impressum.privacy.title')}</h2>
                    <p className="text-muted-foreground">{t('content:impressum.privacy.description')}</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{t('content:impressum.copyright.title')}</h2>
                    <p className="text-muted-foreground">{t('content:impressum.copyright.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      {/* Spacer vor Footer (Figma: 96px) */}
      <section className="bg-white">
        <PageContainer paddingYClassName="py-24">{null}</PageContainer>
      </section>

      {/* Footer */}
      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </body>
  );
};
export default Impressum;
