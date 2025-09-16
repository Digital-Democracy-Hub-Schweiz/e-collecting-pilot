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
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        {t('common:skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb (Figma) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">{t('common:breadcrumb.home')}</a> <span className="inline-block mx-[7px]">›</span> {t('common:breadcrumb.project')}
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

        {/* Hero-ähnlicher Titelblock (Figma Detailseite) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-14 md:py-16 flex flex-col items-start">
              <h1 className="text-[28px] leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937] max-w-[1024px]">{t('content:project.title')}</h1>
              <div className="h-6 md:h-10" />
              <p className="text-[18px] leading-[28px] md:text-[22px] md:leading-[33px] font-medium text-[#1f2937] max-w-[1024px]">
                {t('content:project.description')}
              </p>
              <div className="h-12 md:h-24" />
            </div>
          </PageContainer>
        </section>

        {/* Detail-Content (Figma Detailseite) */}
        <section className="bg-white">
          <PageContainer>
            <div className="w-full max-w-[805px]">
              <div className="max-w-none">
                <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">{t('content:project.participationTitle')}</h2>
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t('content:project.eidTitle')}</h3>
                <p>{t('content:project.eidDescription')}</p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t('content:project.swiyuTitle')}</h3>
                <p>{t('content:project.swiyuDescription')}</p>

                <div className="mt-6 space-y-2">
                  <a href="https://apps.apple.com/ch/app/swiyu/id6737259614" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">{t('content:project.links.ios')}</a>
                  <a href="https://play.google.com/store/apps/details?id=ch.admin.foitt.swiyu&pli=1" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">{t('content:project.links.android')}</a>
                  <a href="https://www.bcs.admin.ch/bcs-web/" target="_blank" rel="noopener noreferrer" className="block text-primary hover:text-primary/80 underline underline-offset-4">{t('content:project.links.betaId')}</a>
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

      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </body>
  );
};

export default Projekt;

