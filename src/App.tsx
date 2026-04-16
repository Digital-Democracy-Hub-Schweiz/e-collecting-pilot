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
import EIdCredentialFlow from "./pages/EIdCredentialFlow";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import { LanguageDetector } from "@/components/LanguageDetector";
import { useEffect, type ComponentType } from "react";
import { getLocalizedPath, detectUserLanguage, routeTranslations, type RouteKey } from "@/utils/routing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

// Developer console message
const showDeveloperMessage = () => {
  if (typeof console === 'undefined') return;

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

// Component to handle language routing
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const urlLang = lang || 'de';
    if (['de', 'fr', 'it', 'rm', 'en'].includes(urlLang)) {
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    } else {
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

// Route key to component mapping
const routeComponents: Record<RouteKey, ComponentType> = {
  volksbegehren: Volksbegehren,
  anleitung: Anleitung,
  projekt: Projekt,
  impressum: Impressum,
  stimmregister: EIdCredentialFlow,
};

// Generate localized routes programmatically from routeTranslations
const generateLocalizedRoutes = () => {
  const seenSlugs = new Set<string>();
  const routes: React.ReactElement[] = [];

  for (const langRoutes of Object.values(routeTranslations)) {
    for (const [key, slug] of Object.entries(langRoutes)) {
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const Component = routeComponents[key as RouteKey];
      routes.push(
        <Route key={slug} path={`/:lang/${slug}`} element={
          <LanguageWrapper><Component /></LanguageWrapper>
        } />
      );

      // Volksbegehren detail routes (renders Index with preselected item)
      if (key === 'volksbegehren') {
        routes.push(
          <Route key={`${slug}-detail`} path={`/:lang/${slug}/:id`} element={
            <LanguageWrapper><Index /></LanguageWrapper>
          } />
        );
      }
    }
  }

  return routes;
};

const App = () => {
  useEffect(() => {
    showDeveloperMessage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin routes (no language prefix, no LanguageDetector) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />

            {/* All other routes with LanguageDetector */}
            <Route path="*" element={
              <LanguageDetector>
                <Routes>
                  {/* Home route */}
                  <Route path="/:lang" element={
                    <LanguageWrapper><Index /></LanguageWrapper>
                  } />

                  {/* Programmatically generated localized routes */}
                  {generateLocalizedRoutes()}

                  {/* Legacy routes without language prefix (redirect to detected language) */}
                  <Route path="/initiative/:id" element={<LegacyRedirect />} />
                  <Route path="/referendum/:id" element={<LegacyRedirect />} />
                  <Route path="/volksbegehren/:id" element={<LegacyRedirect />} />
                  <Route path="/impressum" element={<LegacyImpressumRedirect />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LanguageDetector>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
