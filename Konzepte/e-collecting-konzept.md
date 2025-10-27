# E-Collecting mit swiyu E-ID (SSI-basiert)

## 1. Zielsetzung
E-Collecting ermöglicht es Bürger:innen, mit Hilfe der
SSI-basierten **swiyu E-ID App** ihre Stimmberechtigung nachzuweisen und
Willensbekundungen **fälschungssicher, anonym und einmalig** für ein
konkretes Volksbegehren abzugeben.

Die Lösung soll:
- **Anonymität** der Bürger:innen gewährleisten.
- **Einmaligkeit** sicherstellen (keine Doppelunterzeichnung).
- **Öffentliche Verifizierbarkeit** der Resultate bieten.
- die Direkte Demokratie der Schweiz abbilden.
- die möglichkeit bieten, dass auch der Papierbasierte Prozess abgebildet werden kann.

---

## 2. Beteiligte Rollen
- **Bürger:innen**: Stimmberechtigte Einwohner:innen mit swiyu E-ID App.
- **Gemeinde**: Prüft Stimmberechtigung und stellt initiative-spezifisches Credential aus.
- **Initiativkomitee**: Reicht Volksbegehren ein, erhält Initiative-ID.
- **Öffentliches Register/Log**: Unveränderliches, verifizierbares Log (Blockchain, verteiltes Ledger).
- **Auditor:innen**: Unabhängige Prüfer:innen (z. B. Universitäten, NGOs).

---

## 3. User Stories

### Bürger:innen
- *Als Bürger:in* möchte ich mich mit meiner swiyu eID bei der Gemeinde ausweisen,  
  *damit* ich ein Stimmregister-Credential für eine bestimmte Initiative erhalte.  
- *Als Bürger:in* möchte ich meine Willensbekundung anonym abgeben,  
  *damit* niemand meine Identität oder Entscheidung nachvollziehen kann.  
- *Als Bürger:in* möchte ich einen Nachweis erhalten, dass meine Stimme gezählt wurde,  
  *damit* ich Vertrauen in das System habe.  

### Gemeinde
- *Als Gemeinde* möchte ich prüfen können, ob eine Person in meinem Register
  stimmberechtigt ist,  
  *damit* nur berechtigte Bürger:innen ein Credential erhalten.  
- *Als Gemeinde* möchte ich die Credentials Volksbegehren-spezifisch ausstellen,  
  *damit* jedes Volksbegehren sauber getrennt ist.  

### Initiativkomitee
- *Als Initiativkomitee* möchte ich die gesammelten Unterstützungen öffentlich verifizieren können,  
  *damit* ich die Initiative rechtsgültig einreichen kann.  

### Auditor:innen
- *Als Auditor:in* möchte ich alle Nullifier und Beweise einsehen können,  
  *damit* ich die Korrektheit unabhängig bestätigen kann.  

---

## 4. Prozessablauf

### A) Credential-Ausgabe
1. Bürger:in authentifiziert sich über **swiyu E-ID App**.  
2. Gemeinde prüft Stimmberechtigung im Stimmregister.  
3. Gemeinde stellt ein **Stimmregister-Credential** aus:  
   - Enthält: *Volksbegehren-ID (Salt)*, Stimmberechtigung.  
   - Wird anonym im Wallet gespeichert.  

### B) Stimmabgabe / Unterschrift
1. Bürger:in wählt in der App das Volksbegehren (über ID/QR-Code).  
2. App generiert **Zero-Knowledge-Proof**:  
   - „Ich habe ein gültiges Stimmregister-Credential für Volksbegehren X.“  
   - „Ich habe für Volksbegehren X noch nicht unterschrieben.“  
3. Nullifier = Funktion(Credential + Volksbegehren-ID).  
4. Volksbegehren wird verschlüsselt ins **öffentliche Log** eingetragen.  

### C) Verifikation & Auszählung
1. Jeder Bürger kann im Log prüfen, ob sein **Nullifier** erscheint.  
2. Komitees und Auditor:innen zählen die gültigen Nullifier.  
3. Ergebnis: Anzahl gültiger Unterstützungen (≥ Schwelle → Volksbegehren gültig).  

---

## 5. Funktionale Anforderungen
- **Eindeutigkeit**: Jede Person darf pro Volksbegehren genau einmal teilnehmen.  
- **Anonymität**: Unterstützungsbekundungen dürfen nicht auf Personen zurückführbar sein.  
- **Öffentliche Prüfbarkeit**: Log ist öffentlich zugänglich, Beweise maschinenlesbar.  
- **Volksbegehren-ID als Salt**: Für jedes Volksbegehren eindeutig, öffentlich, nicht geheim.  
- **Kompatibilität**: Integration in bestehende Rechts- und Gemeindeprozesse.  

---

## 6. Nicht-funktionale Anforderungen
- **Sicherheit**: Kryptografisch gesichert (ZK-Proofs, Nullifier, SSI).  
- **Datenschutz**: DSGVO- und DSG-konform, keine Speicherung von PII im Log.  
- **Skalierbarkeit**: Tausende gleichzeitige Unterstützungsbekundungen müssen möglich sein.  
- **Barrierefreiheit**: App in DE/FR/IT/RM, Screenreader-Unterstützung.  
- **Resilienz**: Redundante Infrastruktur, Fallback bei Ausfall.  

---

## 7. Technische Eckpunkte
- **SSI-Framework**: Verifiable Credentials (W3C Standard).  
- **ZK-Technologie**: z. B. zk-SNARKs oder BBS+ Signaturen für Anonymitätsnachweise.  
- **Ledger**: Permissioned Blockchain (z. B. Hyperledger, Tendermint) oder öffentliches, verifizierbares Log.  
- **Threshold-Kryptografie**: Mehrere Schlüsselträger für Entschlüsselung.  

---

## 8. Rechtlicher Rahmen
- **Anpassung Wahlgesetz**: E-Collecting = rechtsgültig.  
- **Gemeinde-Integration**: Gemeinden bleiben die autoritativen Prüfer.  
- **Transparenzpflicht**: Quelloffene Software, Audits vor Einführung.  

---

## 9. Abnahmekriterien
- Erfolgreiche Pilotinitiative mit >90 % Erfolgsquote in Verifikation.
- Positive unabhängige Audits (Sicherheit, Datenschutz, Usability).
- Bürger:innen können ihre Teilnahme prüfen, ohne sich zu enttarnen.

---

## Lizenz

Dieses Werk ist lizenziert unter der [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).