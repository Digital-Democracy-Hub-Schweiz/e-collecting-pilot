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

const App = () => (
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

export default App;
