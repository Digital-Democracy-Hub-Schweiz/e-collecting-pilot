## E‑Collecting Pilot

Pilotanwendung zur elektronischen Unterstützung von Volksbegehren (Initiativen und Referenden). Die Webseite demonstriert, wie Betroffene mittels Beta‑ID ein Quittungs‑Credential erhalten und wie eine Verifizierung dieser Nachweise abläuft.

Dieser Pilot ist ausschliesslich für Demonstrationszwecke. Funktionen, Daten und angebundene Services können unvollständig, instabil oder nicht aktuell sein.

### Links
- **Beta‑ID & Swiyu**: `https://www.eid.admin.ch/de`
- **Beta Credential Service (BCS)**: `https://www.bcs.admin.ch/bcs-web/#/`
- **Swiss Design System**: `https://swiss.github.io/designsystem/`

## Datenquellen
- `src/data/initiatives.json` und `src/data/referendums.json` dienen als Beispiel‑/Demodaten und können inhaltlich vom aktuellen Stand abweichen.

## Routing & Deep‑Links
Die Startseite (`src/pages/Index.tsx`) unterstützt Deep‑Links zur Vorbelegung:
- `/initiative/:idOrSlug`
- `/referendum/:idOrSlug`

Beim Aufruf wird der entsprechende Eintrag gesucht und im Aussteller‑Formular vorbelegt.

## Bekannte Einschränkungen
- Pilot/Prototyp ohne Gewährleistung; ausschliesslich Demonstrationszwecke.
- Externe Services können temporär nicht erreichbar sein; Fehlerzustände werden im UI angezeigt.
- Die Endpunkte sind fest im Code verdrahtet.

## Mitwirkende & Kontakt
Made with ❤️ by [Digital Democracy Hub Schweiz](https://www.digitaldemocracyhub.ch/).

Quellcode: `https://github.com/Digital-Democracy-Hub-Schweiz/e-collecting-pilot`

—
Hinweis: Für die Nutzung ist eine Beta‑ID (Swiyu‑Wallet) erforderlich. Weitere Informationen beim Bund: `https://www.eid.admin.ch/de`.
