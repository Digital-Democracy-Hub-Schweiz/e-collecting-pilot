import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Youtube, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCurrentLanguage } from "@/utils/routing";
import type { SystemHealth } from "@/services/healthAPI";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
 

interface FooterProps {
  healthStatus?: SystemHealth;
  healthLoading?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ healthStatus, healthLoading }) => {
  const { t } = useTranslation(['common', 'content']);
  const currentLang = useCurrentLanguage();
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const NavigationItem = ({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void }) => (
    <div className="h-16 relative w-full group">
      <div className="absolute flex items-center justify-start left-0 right-[47px] top-1/2 -translate-y-1/2">
        <div className="flex-1 flex flex-col justify-center text-[18px] text-white font-medium leading-[28px]">
          {onClick ? (
            <button type="button" onClick={onClick} className="text-left hover:text-white/80 transition-colors">
              {children}
            </button>
          ) : href ? (
            <a href={href} className="hover:text-white/80 transition-colors">
              {children}
            </a>
          ) : (
            <span>{children}</span>
          )}
        </div>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 overflow-hidden">
        <ChevronRight className="w-full h-full text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#848e99]" />
    </div>
  );

  const SocialButton = ({ icon: Icon, children, href }: { icon: React.ElementType; children: React.ReactNode; href: string }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
    >
      <div className="w-6 h-6 overflow-hidden">
        <Icon className="w-full h-full" />
      </div>
      <span className="text-[18px] font-medium leading-[28px]">{children}</span>
    </a>
  );

  const getStatusClass = (status?: string) => (status === 'UP' ? 'text-green-100' : 'text-red-100');

  const StatusItem = ({ label, statusValue }: { label: string; statusValue?: string }) => (
    <div className="h-16 relative w-full">
      <div className="absolute flex items-center justify-between left-0 right-0 top-1/2 -translate-y-1/2">
        <div className="text-[18px] text-white font-medium leading-[28px]">
          {label}
        </div>
        <div className={`text-[18px] font-medium leading-[28px] ${getStatusClass(statusValue)}`}>
          {statusValue || t('common:offline')}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#848e99]" />
    </div>
  );

  const handleAccessibilityOk = () => {
    window.open('https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot/issues/18', '_blank');
    setAccessibilityOpen(false);
  };

  return (
    <footer className="text-white">
      {/* Main Footer Section */}
      <div className="bg-[#334254]">
        {/* Desktop Layout (3xl breakpoint) */}
        <div className="hidden xl:block">
          <div className="max-w-[2000px] mx-auto px-40 py-32">
            <div className="flex gap-16 items-start justify-start">
              {/* About Us Section */}
              <div className="w-[440px] space-y-10">
                <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                  {t('common:footer.project')}
                </h2>
                <div className="text-[18px] font-medium leading-[28px] text-white">
                  <p>{t('content:footer.projectDescription')}</p>
                  <p className="mt-4 text-white" dangerouslySetInnerHTML={{ __html: t('content:footer.copyright') }} />
                  <p className="text-white">{t('content:footer.dataCredit')}</p>
                </div>
              </div>

              {/* Stay Informed Section */}
              <div className="w-[340px] space-y-10">
                <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                  {t('common:footer.stayInformed')}
                </h2>
                <div className="space-y-[45px]">
                  <div className="flex gap-[33px] items-center">
                    <SocialButton icon={Linkedin} href="https://www.linkedin.com/company/digital-democracy-hub-schweiz-fachstelle-f%C3%BCr-demokratie-und-digitalisierung/">
                      LinkedIn
                    </SocialButton>
                    <SocialButton icon={Youtube} href="https://youtu.be/WGUTi2jSaYw?feature=shared&t=7225">
                      YouTube
                    </SocialButton>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-white text-white hover:bg-white/10 px-5 py-2.5 rounded-sm"
                    asChild
                  >
                    <a href="https://links.ecollecting.ch/newsletter" target="_blank" rel="noopener noreferrer">
                      <span className="text-[18px] font-semibold leading-[1.556]">{t('common:footer.newsletter')}</span>
                      <ChevronRight className="w-6 h-6 ml-1" />
                    </a>
                  </Button>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <h3 className="text-[18px] font-medium text-white">{t('common:footer.contact')}</h3>
                  <div className="space-y-2 text-[16px] text-white">
                    <p>{t('content:footer.contact.organization')}</p>
                    <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.email') }} />
                    <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.web') }} />
                  </div>
                </div>
              </div>

              {/* More Information Section */}
              <div className="space-y-[39px]">
                <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                  {t('common:footer.externalLinks')}
                </h2>
                <div className="flex gap-16">
                  <div className="w-[300px] space-y-0">
                    <NavigationItem href="https://www.eid.admin.ch/de">
                      {t('content:footer.externalLinks.swiyuWallet')}
                    </NavigationItem>
                    <NavigationItem href="https://www.bcs.admin.ch/bcs-web/">
                      {t('content:footer.externalLinks.betaIdService')}
                    </NavigationItem>
                  </div>
                  {/* Systemstatus im Medien-Stil */}
                  <div className="w-[300px] space-y-0">
                    <StatusItem label={t('common:footer.services.verifierMgmt')} statusValue={healthLoading ? t('common:loading') : healthStatus?.verifierManagement?.status} />
                    <StatusItem label={t('common:footer.services.issuerMgmt')} statusValue={healthLoading ? t('common:loading') : healthStatus?.issuerManagement?.status} />
                    <StatusItem label={t('common:footer.services.issuerOid4vci')} statusValue={healthLoading ? t('common:loading') : healthStatus?.issuerOid4vci?.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout (xs breakpoint) */}
        <div className="block xl:hidden">
          <div className="px-5 py-10 space-y-9">
            {/* About Us Section */}
            <div className="space-y-4">
              <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                {t('common:footer.project')}
              </h2>
              <div className="text-[18px] font-medium leading-[28px] text-white">
                <p>{t('content:footer.projectDescription')}</p>
                <p className="mt-4 text-white" dangerouslySetInnerHTML={{ __html: t('content:footer.copyright') }} />
                <p className="text-white">{t('content:footer.dataCredit')}</p>
              </div>
            </div>

            {/* Stay Informed Section */}
            <div className="space-y-4">
              <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                {t('common:footer.stayInformed')}
              </h2>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-9 items-center">
                  <SocialButton icon={Linkedin} href="https://www.linkedin.com/company/digital-democracy-hub-schweiz-fachstelle-f%C3%BCr-demokratie-und-digitalisierung/">
                    LinkedIn
                  </SocialButton>
                  <SocialButton icon={Youtube} href="https://youtu.be/WGUTi2jSaYw?feature=shared&t=7225">
                    YouTube
                  </SocialButton>
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-5 py-2.5 rounded-sm w-full"
                  asChild
                >
                  <a href="https://links.ecollecting.ch/newsletter" target="_blank" rel="noopener noreferrer">
                    <span className="text-[18px] font-semibold leading-[1.556]">{t('common:footer.newsletter')}</span>
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </a>
                </Button>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t border-white/20">
                <h3 className="text-[18px] font-medium text-white">{t('common:footer.contact')}</h3>
                <div className="space-y-2 text-[16px] text-white">
                  <p>{t('content:footer.contact.organization')}</p>
                  <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.email') }} />
                  <p dangerouslySetInnerHTML={{ __html: t('content:footer.contact.web') }} />
                </div>
              </div>
            </div>

            {/* More Information Section */}
            <div className="space-y-2">
              <h2 className="text-[22px] font-semibold leading-[33px] text-white">
                {t('common:footer.externalLinks')}
              </h2>
              <div className="space-y-1">
                <NavigationItem href="https://www.eid.admin.ch/de">
                  {t('content:footer.externalLinks.swiyuWallet')}
                </NavigationItem>
                <NavigationItem href="https://www.bcs.admin.ch/bcs-web/">
                  {t('content:footer.externalLinks.betaIdService')}
                </NavigationItem>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/20">
                <StatusItem label={t('common:footer.services.verifierMgmt')} statusValue={healthLoading ? t('common:loading') : healthStatus?.verifierManagement?.status} />
                <StatusItem label={t('common:footer.services.issuerMgmt')} statusValue={healthLoading ? t('common:loading') : healthStatus?.issuerManagement?.status} />
                <StatusItem label={t('common:footer.services.issuerOid4vci')} statusValue={healthLoading ? t('common:loading') : healthStatus?.issuerOid4vci?.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Section */}
      <div className="bg-[#293644]">
        {/* Desktop Layout */}
        <div className="hidden xl:block">
          <div className="max-w-[2000px] mx-auto px-40 py-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-8 items-start text-[16px] font-medium leading-[24px] text-white">
                <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Rechtliches</a>
                <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Datenschutz</a>
                <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Impressum</a>
                <button type="button" onClick={() => setAccessibilityOpen(true)} className="hover:text-white/80 transition-colors">Barrierefreiheit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block xl:hidden px-5 py-7 space-y-9">
          <div className="flex flex-wrap gap-9 text-[16px] font-medium leading-[24px] text-white">
            <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Rechtliches</a>
            <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Datenschutz</a>
            <a href={`/${currentLang}/impressum`} className="hover:text-white/80 transition-colors">Impressum</a>
            <button type="button" onClick={() => setAccessibilityOpen(true)} className="hover:text-white/80 transition-colors">Barrierefreiheit</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AlertDialog open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
        <AlertDialogContent className="max-w-[480px] rounded-[2px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[22px] leading-[33px] text-[#1f2937]">Barrierefreiheit</AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] leading-[28px] text-[#1f2937]">
              Hilfst du mir bei der Umsetzung dieses Features?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[18px] leading-[28px]">Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccessibilityOk} className="bg-[#5c6977] hover:bg-[#4c5967] text-white text-[18px] leading-[28px]">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* separater Status-/Link-Bereich entfernt: Status ist in Spalte integriert */}
    </footer>
  );
};