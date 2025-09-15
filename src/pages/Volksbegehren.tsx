import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useHealthStatus } from "@/hooks/use-health-status";
import PageContainer from "@/components/PageContainer";
import { Share2, Printer } from "lucide-react";
import { useCurrentLanguage } from "@/utils/routing";
import React from "react";

const Volksbegehren = () => {
  const { data: healthStatus, isLoading: healthLoading } = useHealthStatus();
  const currentLang = useCurrentLanguage();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = document.title || "Teilen";
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link kopiert.");
      } else {
        window.prompt("Link kopieren:", url);
      }
    } catch (_) {}
  };
  const handlePrint = () => window.print();

  return (
    <body className="min-h-screen bg-white flex flex-col">
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Zum Hauptinhalt springen
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb (wie Projekt) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href={`/${currentLang}`} className="hover:text-[#1f2937] underline underline-offset-4">Startseite</a> <span className="inline-block mx-[7px]">›</span> Volksbegehren
            </nav>
          </PageContainer>
        </section>

        {/* Print/Share Section (wie Projekt) */}
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

        {/* Hero Titelblock (wie Projekt) */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-0">
            <div className="py-14 md:py-16 flex flex-col items-start">
              <h1 className="text-[28px] leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937] max-w-[1024px]">Volksbegehren</h1>
              <div className="h-12 md:h-24" />
            </div>
          </PageContainer>
        </section>

        {/* Initiativen Block (Figma-Vorlage) */}
        <SectionCardRow title="Initiativen" />

        {/* Referenden Block (Figma-Vorlage) */}
        <SectionCardRow title="Referenden" />
      </main>

      {/* Spacer vor Footer */}
      <section className="bg-white">
        <PageContainer paddingYClassName="py-24" />
      </section>

      <Footer healthStatus={healthStatus} healthLoading={healthLoading} />
    </body>
  );
};

export default Volksbegehren;


type SectionCardRowProps = { title: string };

const SectionCardRow: React.FC<SectionCardRowProps> = ({ title }) => {
  const cards = React.useMemo(
    () => [
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ],
    []
  );

  return (
    <section className="bg-white">
      <PageContainer>
        {/* Section title */}
        <div className="py-8">
          <h2 className="text-[28px] leading-[36px] md:text-[40px] md:leading-[48px] font-semibold text-[#1f2937]">
            {title}
          </h2>
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.map(card => (
            <article key={card.id} className="bg-white shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]">
              <div className="pt-9 px-7 pb-7">
                {/* Meta */}
                <div className="text-[14px] leading-[18px] text-[#6b7280] flex items-center gap-[10px]">
                  <span className="font-medium">Artikel</span>
                  <span aria-hidden className="text-center w-[21px]">|</span>
                  <span className="font-medium">24. Februar 2023</span>
                </div>
                <div className="h-4" />
                {/* Title */}
                <h3 className="text-[24px] font-semibold text-[#1f2937] leading-snug">Titel</h3>
                <div className="h-4" />
                {/* Description */}
                <p className="text-[18px] leading-[28px] text-[#1f2937]">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed ...
                </p>
                <div className="h-4" />
                {/* Image */}
                <div className="bg-[#f1f4f7] h-[280px] w-full flex items-center justify-center rounded-t-[2px] overflow-hidden">
                  <img src="/placeholder.svg" alt="" className="h-full object-contain" />
                </div>
                <div className="h-6" />
                {/* Footer meta */}
                <div className="text-[18px] leading-[28px] text-[#6b7280]">PDF 3.8 Mb   |   102 Seiten   |   Deutsch</div>
                <div className="h-10" />
                {/* Button (icon-only, bordered) */}
                <div className="flex justify-end">
                  <button type="button" aria-label="Mehr"
                    className="relative border border-[#d8232a] rounded-[1px] p-2 text-[#d8232a] hover:bg-[#d8232a]/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dots (static) */}
        <div className="flex items-center justify-center gap-2 py-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#adb4bc]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#adb4bc]" />
        </div>
      </PageContainer>
    </section>
  );
};


