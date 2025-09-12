import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Projekt from "./pages/Projekt";
import Anleitung from "./pages/Anleitung";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import { LanguageDetector } from "@/components/LanguageDetector";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Helper function to detect user language
const detectUserLanguage = () => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && ['de', 'fr', 'it', 'rm', 'en'].includes(savedLang)) {
    return savedLang;
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
const LegacyRedirect = ({ type }: { type: 'initiative' | 'referendum' | 'volksbegehren' }) => {
  const { id } = useParams<{ id: string }>();
  const detectedLang = detectUserLanguage();
  return <Navigate to={`/${detectedLang}/volksbegehren/${id}`} replace />;
};

// Component to handle legacy impressum redirect
const LegacyImpressumRedirect = () => {
  const detectedLang = detectUserLanguage();
  return <Navigate to={`/${detectedLang}/impressum`} replace />;
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
          
          {/* Legacy routes without language prefix (redirect to German) */}
          <Route path="/initiative/:id" element={<LegacyRedirect type="initiative" />} />
          <Route path="/referendum/:id" element={<LegacyRedirect type="referendum" />} />
          <Route path="/volksbegehren/:id" element={<LegacyRedirect type="volksbegehren" />} />
          
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
