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

Three external backend services on `*.ecollecting.ch` (Spring Boot, health via `/actuator/health`). API clients are in `src/services/` -- each is a class-based singleton. The credential flow uses SD-JWT verifiable credentials (ES256) with the swiyu-Wallet.

#### Verifier Identity

- **Base URL:** `https://verifier-identity.ecollecting.ch/management/api`
- **Client:** `src/services/verificationAPI.ts` (singleton `verificationBusinessAPI`)
- **Purpose:** Verifies a citizen's Beta-ID via OpenID4VP presentation requests. The frontend creates a verification, receives a `verification_url` (deeplink for swiyu-Wallet), and polls for status.

| Endpoint | Method | Description |
|---|---|---|
| `/verifications` | POST | Create a new presentation request. Requests selective disclosure of `family_name`, `given_name`, `birth_date` from a `betaid-sdjwt` credential. |
| `/verifications/{id}` | GET | Poll verification status. States: `PENDING`, `SUCCESS`, `FAILED`. On `SUCCESS`, `wallet_response` contains the disclosed claims. |

#### Issuer Receipt

- **Base URL:** `https://issuer-receipt.ecollecting.ch/management/api`
- **Client:** `src/services/issuerAPI.ts` (singleton `issuerBusinessAPI`)
- **Purpose:** Issues a signing receipt credential after a citizen successfully signs an initiative/referendum. The receipt is offered as a deeplink to the swiyu-Wallet.

| Endpoint | Method | Description |
|---|---|---|
| `/credentials` | POST | Issue a new receipt credential. Payload includes `firstName`, `lastName`, `birthDate`, `signDate`, `type`, `title`, `comitee`, `level`, plus validity and status-list config. Returns `offer_deeplink`. |
| `/credentials/{id}/status` | GET | Check issuance status of a receipt credential. |

#### Issuer Stimmrecht

- **Base URL:** `https://issuer-stimmrecht.ecollecting.ch/management/api`
- **Client:** `src/services/gemeindeIssuerAPI.ts` (singleton `gemeindeIssuerAPI`)
- **Purpose:** Issues Gemeinde-level voting-right credentials (Stimmrechtsausweise). Used by Gemeinde admins to grant citizens a verifiable voting-right credential tied to a specific Volksbegehren.

| Endpoint | Method | Description |
|---|---|---|
| `/credentials` | POST | Issue a new Stimmrecht credential. Payload includes `nullifier`, `volksbegehren`, `issuerDid`, `issuedDate`, plus validity and status-list config. Returns `offer_deeplink`. |
| `/credentials/{id}` | GET | Get full credential details. |
| `/credentials/{id}/status` | GET | Check issuance status. |
| `/credentials/{id}/status?credentialStatus={status}` | PATCH | Update credential status (e.g. suspend). |
| `/credentials/{id}/revoke` | POST | Revoke an issued credential. |

#### Health Monitoring

All three services expose Spring Boot Actuator endpoints (`/actuator/health`). The `src/services/healthAPI.ts` client (singleton `healthAPI`) provides `getSystemHealth()` which polls all three in parallel and returns a `SystemHealth` object.

### Supabase

Database with tables: `volksbegehren` (multilingual title/description columns `title_{lang}`, `description_{lang}`), `einwohner`, `gemeinden`, `gemeinde_admins`, `credentials`, `user_roles`. Auth uses Supabase Auth. The client is at `src/integrations/supabase/client.ts` and requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars. Types in `src/integrations/supabase/types.ts` are auto-generated.

### Address Search Proxy

The Open Buildings API (osbapi.liip.ch) is proxied through `/api/address-search` to avoid CORS. In dev this uses the Vite proxy config; in production it uses Vercel rewrites (`vercel.json`).

### Admin

Protected routes at `/auth` and `/admin` (no language prefix, no `LanguageDetector`). Admin components in `src/components/admin/` manage Gemeinden, Einwohner, Stimmregister, and Volksbegehren. Roles: `admin` | `user` (enum `app_role`).

### Design System

Uses Swiss Design System colors (`swiss-red`, `swiss-gray-*`, etc.) defined as CSS custom properties and extended in `tailwind.config.ts`. Font: Noto Sans.
