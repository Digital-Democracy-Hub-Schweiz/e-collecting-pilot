# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-Collecting Pilot is a civic-tech project by Digital Democracy Hub Switzerland. It enables citizens to digitally sign initiatives and referendums using the Swiss Beta-ID (swiyu-Wallet). The app integrates with the Swiss federal Beta Credential Service (BCS) for verifiable credentials (SD-JWT with ES256).

## Commands

- `npm run dev` -- start Vite dev server on port 8080
- `npm run build` -- production build
- `npm run build:dev` -- development build
- `npm run lint` -- ESLint
- `npm run preview` -- preview production build

## Architecture

**Stack:** React 18 + TypeScript, Vite (SWC), Tailwind CSS, shadcn/ui (Radix), Supabase, react-i18next, React Router v6, TanStack Query.

**Path alias:** `@/` maps to `./src/`.

### Routing & i18n

All public routes are language-prefixed (`/:lang/...`). Route slugs are translated per language in `src/utils/routing.ts` (e.g., `/de/volksbegehren`, `/fr/objet-votation-populaire`, `/en/popular-vote`). Five languages: de, fr, it, rm, en. German is the fallback language.

Translation files live in `src/i18n/locales/{lang}/` with four namespaces: `common`, `forms`, `content`, `errors`. The default namespace is `common`.

When adding new routes, define slug translations in `routeTranslations` in `src/utils/routing.ts` and add all language variants in `App.tsx`. Legacy routes without language prefix redirect to the detected language.

### Backend Services

Three external backend services on `*.ecollecting.ch` (Spring Boot, health via `/actuator/health`):

| Service | Base URL | Purpose |
|---|---|---|
| Verifier | `verifier-identity.ecollecting.ch` | Beta-ID verification (presentation requests) |
| Issuer Receipt | `issuer-receipt.ecollecting.ch` | Issues signing receipt credentials |
| Issuer Stimmrecht | `issuer-stimmrecht.ecollecting.ch` | Issues Gemeinde voting-right credentials |

API clients are in `src/services/` -- each is a class-based singleton. The credential flow uses SD-JWT verifiable credentials with the swiyu-Wallet.

### Supabase

Database with tables: `volksbegehren` (multilingual title/description columns `title_{lang}`, `description_{lang}`), `einwohner`, `gemeinden`, `gemeinde_admins`, `credentials`, `user_roles`. Auth uses Supabase Auth. The client is at `src/integrations/supabase/client.ts` and requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars. Types in `src/integrations/supabase/types.ts` are auto-generated.

### Address Search Proxy

The Open Buildings API (osbapi.liip.ch) is proxied through `/api/address-search` to avoid CORS. In dev this uses the Vite proxy config; in production it uses Vercel rewrites (`vercel.json`).

### Admin

Protected routes at `/auth` and `/admin` (no language prefix, no `LanguageDetector`). Admin components in `src/components/admin/` manage Gemeinden, Einwohner, Stimmregister, and Volksbegehren. Roles: `admin` | `user` (enum `app_role`).

### Design System

Uses Swiss Design System colors (`swiss-red`, `swiss-gray-*`, etc.) defined as CSS custom properties and extended in `tailwind.config.ts`. Font: Noto Sans.
