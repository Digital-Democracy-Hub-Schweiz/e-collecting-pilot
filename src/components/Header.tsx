import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useCurrentLanguage, getLocalizedPath } from '@/utils/routing';
import { useLocation } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
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

// Local assets (Top-Bar Icons)
const ICON_SIGN_LANGUAGE = '/icons/signlanguage.svg';
const ICON_EASY_LANGUAGE = '/icons/easylanguage.svg';

export const Header: React.FC = () => {
  const { t } = useTranslation(['common', 'content']);
  const currentLang = useCurrentLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [easyLangOpen, setEasyLangOpen] = useState(false);
  const [signLangOpen, setSignLangOpen] = useState(false);
  const location = useLocation();

  const navItems: { label: string; href: string }[] = [
    { label: t('common:navigation.pilot'), href: `/${currentLang}` },
    { label: t('common:navigation.instructions'), href: getLocalizedPath(currentLang, 'anleitung') },
    { label: t('common:navigation.project'), href: getLocalizedPath(currentLang, 'projekt') },
    { label: t('common:navigation.volksbegehren'), href: getLocalizedPath(currentLang, 'volksbegehren') },
    // { label: t('common:navigation.stimmregister', 'Stimmregister'), href: getLocalizedPath(currentLang, 'stimmregister') },
  ];

  const handleEasyLanguageOk = () => {
    window.open('https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot/issues/7', '_blank');
    setEasyLangOpen(false);
  };

  const handleSignLanguageOk = () => {
    window.open('https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot/issues/17', '_blank');
    setSignLangOpen(false);
  };

  // Lock scroll when mobile menu is open & close on ESC
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = original;
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [mobileOpen]);

  return (
    <header id="main-header" role="banner" className="sticky top-0 z-50">
      {/* Top Bar (Figma: secondary/600 #334254) */}
      <div className="top-bar text-white" style={{ backgroundColor: '#334254', paddingTop: 'env(safe-area-inset-top)' }}>
        <PageContainer className="h-[60px]">
          <div className="h-full flex items-center justify-end">
            {/* Rechte Seite: Leichte Sprache, Gebärdensprache, Sprache */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                className="flex items-center gap-2 text-white p-0 leading-none hover:opacity-80"
                aria-label={t('common:accessibility.easyLanguage')}
                onClick={() => setEasyLangOpen(true)}
              >
                {/* Label left (hidden on xs), icon right */}
                <span className="hidden sm:inline text-[16px] leading-[24px] font-medium">{t('common:accessibility.easyLanguage')}</span>
                <img src={ICON_EASY_LANGUAGE} alt="" className="w-[22px] h-[22px] invert" />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-white p-0 leading-none hover:opacity-80"
                aria-label={t('common:accessibility.signLanguage')}
                onClick={() => setSignLangOpen(true)}
              >
                <span className="hidden sm:inline text-[16px] leading-[24px] font-medium">{t('common:accessibility.signLanguage')}</span>
                <img src={ICON_SIGN_LANGUAGE} alt="" className="w-[22px] h-[22px] invert" />
              </button>
              <div className="block">
                <LanguageSwitcher variant="topbar" />
              </div>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Top Header */}
      <div className="top-header bg-white">
        <PageContainer className="h-auto">
          <div className="h-full flex items-center justify-between py-2 sm:py-0">
            <a href={`/${currentLang}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="flex items-center">
                <img src="/lovable-uploads/e75dd54e-b28f-48bc-8d17-683d07664c09.png" alt="Beta" className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] leading-[18px] sm:text-[18px] sm:leading-[28px] font-semibold text-[#1f2937]">
                  Digital Democracy Hub Schweiz
                </div>
                <div className="text-[12px] leading-[15px] sm:text-[16px] sm:leading-[24px] text-[#1f2937]">
                  E-Collecting Pilotprojekt
                </div>
              </div>
            </a>

            {/* Desktop Controls: Newsletter & Kontakt (keine Sprache hier) */}
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href="https://links.ecollecting.ch/newsletter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] leading-[24px] font-semibold text-[#1f2937] hover:text-[#d8232a]"
              >
                {t('common:navigation.newsletter')}
              </a>
              <a
                href="https://buymeacoffee.com/digitaldemocracyhub/posts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] leading-[24px] font-semibold text-[#1f2937] hover:text-[#d8232a]"
              >
                {t('common:navigation.blog')}
              </a>
              <a
                href={getLocalizedPath(currentLang, 'impressum')}
                className="text-[16px] leading-[24px] font-semibold text-[#1f2937] hover:text-[#d8232a]"
              >
                {t('common:navigation.contact')}
              </a>
            </nav>

            {/* Mobile Controls (ohne Sprache hier) */}
            <div className="flex lg:hidden items-center gap-3">
              <button aria-label="Toggle menu" onClick={() => setMobileOpen(v => !v)} className="p-2 rounded hover:bg-muted/50">
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Mainmenu (Desktop) */}
      <div className="hidden lg:block bg-white border-b border-[#e0e4e8]">
        <PageContainer>
          <div className="relative h-[56px] flex items-center gap-8 text-[18px] leading-[28px] text-[#1f2937]">
            {navItems.map(item => {
              const isActive = location.pathname === item.href || (item.href !== `/${currentLang}` && location.pathname.startsWith(item.href));
              return (
                <div key={item.label} className="relative py-4">
                  <a href={item.href} className="hover:text-[#d8232a] transition-colors">
                    {item.label}
                  </a>
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-[#d8232a]" />
                  )}
                </div>
              );
            })}
          </div>
        </PageContainer>
      </div>

      {/* Modal: Leichte Sprache Bestätigung */}
      <AlertDialog open={easyLangOpen} onOpenChange={setEasyLangOpen}>
        <AlertDialogContent className="max-w-[480px] rounded-[2px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[22px] leading-[33px] text-[#1f2937]">
              {t('common:accessibility.easyLanguageModal.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] leading-[28px] text-[#1f2937]">
              {t('common:accessibility.easyLanguageModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[18px] leading-[28px]">{t('common:accessibility.easyLanguageModal.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEasyLanguageOk} className="bg-[#5c6977] hover:bg-[#4c5967] text-white text-[18px] leading-[28px]">
              {t('common:accessibility.easyLanguageModal.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: Gebärdensprache Bestätigung */}
      <AlertDialog open={signLangOpen} onOpenChange={setSignLangOpen}>
        <AlertDialogContent className="max-w-[480px] rounded-[2px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[22px] leading-[33px] text-[#1f2937]">
              {t('common:accessibility.signLanguageModal.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] leading-[28px] text-[#1f2937]">
              {t('common:accessibility.signLanguageModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[18px] leading-[28px]">{t('common:accessibility.signLanguageModal.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignLanguageOk} className="bg-[#5c6977] hover:bg-[#4c5967] text-white text-[18px] leading-[28px]">
              {t('common:accessibility.signLanguageModal.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Menu Overlay & Panel */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/30 animate-mobile-overlay-in"
          />
          {/* Panel */}
          <div
            aria-modal="true"
            role="dialog"
            className="relative bg-white border-b border-[#e0e4e8] shadow-sm animate-mobile-panel-in"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: '16px' }}
          >
            <div className="max-w-[2000px] mx-auto px-6">
              <div className="flex items-center justify-between py-1">
                <span className="text-[16px] leading-[24px] font-semibold text-[#1f2937]">Menü</span>
                <button aria-label="Close" onClick={() => setMobileOpen(false)} className="p-2 rounded hover:bg-muted/50"><X /></button>
              </div>
              <nav className="py-2">
                <ul className="space-y-1">
                  {navItems.map(item => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-1 py-3 text-[18px] leading-[28px] text-[#1f2937] hover:text-[#d8232a] transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                  {/* Additional mobile-only menu items */}
                  <li>
                    <a
                      href="https://links.ecollecting.ch/newsletter"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="block px-1 py-3 text-[18px] leading-[28px] text-[#1f2937] hover:text-[#d8232a] transition-colors"
                    >
                      {t('common:navigation.newsletter')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://buymeacoffee.com/digitaldemocracyhub/posts"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="block px-1 py-3 text-[18px] leading-[28px] text-[#1f2937] hover:text-[#d8232a] transition-colors"
                    >
                      {t('common:navigation.blog')}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getLocalizedPath(currentLang, 'impressum')}
                      onClick={() => setMobileOpen(false)}
                      className="block px-1 py-3 text-[18px] leading-[28px] text-[#1f2937] hover:text-[#d8232a] transition-colors"
                    >
                      {t('common:navigation.contact')}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
