import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Projekt from "./pages/Projekt";
import Volksbegehren from "./pages/Volksbegehren";
import Anleitung from "./pages/Anleitung";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import { LanguageDetector } from "@/components/LanguageDetector";
import { useEffect } from "react";
import { getLocalizedPath, type SupportedLanguage } from "@/utils/routing";

const queryClient = new QueryClient();

const supportedLanguages: SupportedLanguage[] = ['de', 'fr', 'it', 'rm', 'en'];

// Developer console message
const showDeveloperMessage = () => {
  if (typeof console === 'undefined') return;
  
  // Detect dark mode
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const styles = isDarkMode ? {
    title: 'background: linear-gradient(45deg, #4a9eff, #7c7cff); color: white; padding: 10px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);',
    subtitle: 'background: #5ba3f5; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold;',
    text: 'color: #e2e8f0; font-size: 14px; line-height: 1.5; font-weight: 500;',
    link: 'color: #63b3ed; font-size: 14px; font-weight: bold; text-decoration: underline;',
    highlight: 'background: linear-gradient(120deg, #68d391 0%, #4fd1c7 100%); color: #1a202c; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  } : {
    title: 'background: linear-gradient(45deg, #007aff, #5856d6); color: white; padding: 10px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);',
    subtitle: 'background: #4a90e2; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold;',
    text: 'color: #1a202c; font-size: 14px; line-height: 1.5; font-weight: 500;',
    link: 'color: #2b6cb0; font-size: 14px; font-weight: bold; text-decoration: underline;',
    highlight: 'background: linear-gradient(120deg, #48bb78 0%, #38a169 100%); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  };

  console.log('%c🗳️ E-Collecting Pilot Project', styles.title);
  console.log('%c👋 Hey Developer!', styles.subtitle);
  console.log('%cGreat to see you exploring behind the scenes! 🕵️‍♂️', styles.text);
  console.log('%c─────────────────────────────────────────', isDarkMode ? 'color: #4a5568;' : 'color: #cbd5e0;');
  
  console.log('%c🚀 Want to contribute?', styles.highlight);
  console.log('%c📂 GitHub Repository:', styles.text);
  console.log('%chttps://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot', styles.link);
  console.log('%c• Fork it, create issues, or send pull requests!', styles.text);
  console.log('%c─────────────────────────────────────────', isDarkMode ? 'color: #4a5568;' : 'color: #cbd5e0;');
  
  console.log('%c☕ Support our work!', styles.highlight);
  console.log('%cIf you find this project interesting, consider buying us a coffee:', styles.text);
  console.log('%chttps://buymeacoffee.com/digitaldemocracyhub', styles.link);
  console.log('%c─────────────────────────────────────────', isDarkMode ? 'color: #4a5568;' : 'color: #cbd5e0;');
  
  console.log('%c🛠️ Tech Stack:', styles.text);
  console.log('%c• React + TypeScript', styles.text);
  console.log('%c• Tailwind CSS + Swiss Design System', styles.text);
  console.log('%c• React i18next (5 languages: DE, FR, IT, RM, EN)', styles.text);
  console.log('%c• Verifiable Credentials & Swiss Beta-ID', styles.text);
  console.log('%c• React Router with localized routes', styles.text);
  console.log('%c─────────────────────────────────────────', isDarkMode ? 'color: #4a5568;' : 'color: #cbd5e0;');
  
  console.log('%c🎯 Mission: Making democracy digital & accessible for everyone!', styles.highlight);
  console.log('%cBuilt with ❤️ by Digital Democracy Hub Switzerland', styles.text);
};

// Helper function to detect user language
const detectUserLanguage = (): SupportedLanguage => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && supportedLanguages.includes(savedLang as SupportedLanguage)) {
    return savedLang as SupportedLanguage;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('rm')) return 'rm';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'de'; // fallback
};

// Component to handle language routing
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Always set the language from URL parameter
    const urlLang = lang || 'de'; // fallback to German if no lang in URL
    if (['de', 'fr', 'it', 'rm', 'en'].includes(urlLang)) {
      // Only change if different to avoid unnecessary re-renders
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    } else {
      // If invalid language, fall back to German
      i18n.changeLanguage('de');
    }
  }, [lang, i18n]);
  
  return <>{children}</>;
};

// Component to handle legacy route redirects with parameters
const LegacyRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const detectedLang = detectUserLanguage();
  const target = getLocalizedPath(detectedLang, 'volksbegehren', { id: id ?? '' });
  return <Navigate to={target} replace />;
};

// Component to handle legacy impressum redirect
const LegacyImpressumRedirect = () => {
  const detectedLang = detectUserLanguage();
  const target = getLocalizedPath(detectedLang, 'impressum');
  return <Navigate to={target} replace />;
};

const App = () => {
  // Show developer message on app start
  useEffect(() => {
    showDeveloperMessage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageDetector>
            <Routes>
            {/* Root and routes without language prefix will be handled by LanguageDetector */}
          
          {/* Language-prefixed routes */}
          <Route path="/:lang" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          {/* German routes */}
          <Route path="/:lang/projekt" element={
            <LanguageWrapper>
              <Projekt />
            </LanguageWrapper>
          } />
          <Route path="/:lang/anleitung" element={
            <LanguageWrapper>
              <Anleitung />
            </LanguageWrapper>
          } />
          <Route path="/:lang/volksbegehren" element={
            <LanguageWrapper>
              <Volksbegehren />
            </LanguageWrapper>
          } />
          
          {/* English routes */}
          <Route path="/:lang/project" element={
            <LanguageWrapper>
              <Projekt />
            </LanguageWrapper>
          } />
          <Route path="/:lang/instructions" element={
            <LanguageWrapper>
              <Anleitung />
            </LanguageWrapper>
          } />
          <Route path="/:lang/popular-vote" element={
            <LanguageWrapper>
              <Volksbegehren />
            </LanguageWrapper>
          } />
          
          {/* French routes */}
          <Route path="/:lang/projet" element={
            <LanguageWrapper>
              <Projekt />
            </LanguageWrapper>
          } />
          <Route path="/:lang/instructions" element={
            <LanguageWrapper>
              <Anleitung />
            </LanguageWrapper>
          } />
          <Route path="/:lang/objet-votation-populaire" element={
            <LanguageWrapper>
              <Volksbegehren />
            </LanguageWrapper>
          } />
          
          {/* Italian routes */}
          <Route path="/:lang/progetto" element={
            <LanguageWrapper>
              <Projekt />
            </LanguageWrapper>
          } />
          <Route path="/:lang/istruzioni" element={
            <LanguageWrapper>
              <Anleitung />
            </LanguageWrapper>
          } />
          <Route path="/:lang/oggetto-votazione-popolare" element={
            <LanguageWrapper>
              <Volksbegehren />
            </LanguageWrapper>
          } />
          
          {/* Romansh routes */}
          <Route path="/:lang/instrucziuns" element={
            <LanguageWrapper>
              <Anleitung />
            </LanguageWrapper>
          } />
          <Route path="/:lang/dumonda-populara" element={
            <LanguageWrapper>
              <Volksbegehren />
            </LanguageWrapper>
          } />
          
          {/* Legacy routes without language prefix (redirect to German) */}
          <Route path="/initiative/:id" element={<LegacyRedirect />} />
          <Route path="/referendum/:id" element={<LegacyRedirect />} />
          <Route path="/volksbegehren/:id" element={<LegacyRedirect />} />
          
          {/* Language-prefixed volksbegehren routes */}
          <Route path="/:lang/volksbegehren/:id" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          <Route path="/:lang/objet-votation-populaire/:id" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          <Route path="/:lang/oggetto-votazione-popolare/:id" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          <Route path="/:lang/dumonda-populara/:id" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          <Route path="/:lang/popular-vote/:id" element={
            <LanguageWrapper>
              <Index />
            </LanguageWrapper>
          } />
          
          {/* Language-prefixed impressum routes */}
          {/* German */}
          <Route path="/:lang/impressum" element={
            <LanguageWrapper>
              <Impressum />
            </LanguageWrapper>
          } />
          {/* English */}
          <Route path="/:lang/imprint" element={
            <LanguageWrapper>
              <Impressum />
            </LanguageWrapper>
          } />
          {/* French */}
          <Route path="/:lang/mentions-legales" element={
            <LanguageWrapper>
              <Impressum />
            </LanguageWrapper>
          } />
          {/* Italian */}
          <Route path="/:lang/colofone" element={
            <LanguageWrapper>
              <Impressum />
            </LanguageWrapper>
          } />
          {/* Romansh uses impressum like German */}
          <Route path="/:lang/impressum" element={
            <LanguageWrapper>
              <Impressum />
            </LanguageWrapper>
          } />
          
          {/* Legacy impressum route */}
          <Route path="/impressum" element={<LegacyImpressumRedirect />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageDetector>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
