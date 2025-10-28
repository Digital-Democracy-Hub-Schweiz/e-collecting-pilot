# E-Collecting mit swiyu E-ID & Blockchain V2.0

## 1. Zielsetzung
E-Collecting ermöglicht es Bürger:innen, mit Hilfe der SSI-basierten **swiyu E-ID App** ihre Stimmberechtigung nachzuweisen und Willensbekundungen **fälschungssicher, anonym und einmalig** für ein konkretes Volksbegehren abzugeben.

---
```mermaid
sequenceDiagram
    actor User as Bürger
    participant Portal as E-Collecting Portal
    participant Addr as Adressservice
    participant Gemeinde as Gemeinde System
    participant Wallet as Swiyu Wallet
    participant Issuer as Generic Issuer (Gemeinde)
    participant Verifier as Generic Verifier (Sammler)
    participant DB as Sammler-DB

    Note over User,Issuer: Phase 1: Adressübermittlung & Gemeindezuordnung
    
    User->>Portal: Möchte Stimmrechtsausweis beantragen
    Portal->>User: Fordert Wohnadresse an
    User->>Portal: Übermittelt Strasse, Hausnummer, PLZ, Ort
    Portal->>Addr: Validiert Adressdaten
    Addr->>Addr: Prüft Adresse & ermittelt BFS-Nummer
    Addr-->>Portal: Gibt BFS-Nummer zurück
    Portal->>Portal: Ermittelt zuständige Gemeinde
    
    Note over User,Issuer: Phase 2: Identifikation & Berechtigung
    
    Portal->>User: Zeigt QR-Code für Identifikation (OID4VP)
    User->>Wallet: Scannt QR-Code mit Swiyu Wallet
    Wallet->>Portal: Öffnet Verification Request
    Portal->>Wallet: Fordert Attribute an (Vorname, Nachname, Geburtsdatum, optional AHV-Nr.)
    User->>Wallet: Gibt Freigabe für Attribute
    Wallet->>Portal: Übermittelt selektierte Attribute (SD-JWT VC)
    Portal->>Gemeinde: Leitet Daten zur Prüfung weiter
    
    Gemeinde->>Gemeinde: Prüft Stimmberechtigung
    Gemeinde->>Gemeinde: Prüft Wohnsitz in Gemeinde
    
    alt Bürger ist stimmberechtigt
        Gemeinde-->>Portal: Berechtigung bestätigt
        
        Note over User,Issuer: Phase 3: Volksbegehren-Auswahl
        
        Portal->>User: Zeigt Liste verfügbarer Volksbegehren
        User->>Portal: Wählt Volksbegehren aus
        
        Note over User,Issuer: Phase 4: Stimmrechtsausweis-Ausstellung
        
        Portal->>Issuer: Fordert Stimmrechtsausweis-Credential an
        
        alt Stimmrechtsausweis ausstellen    
            Issuer->>Issuer: Berechnet Nullifier = Hash(PersonID + VolksbegehrensID + Secret)
            Issuer->>Issuer: Erstellt Credential mit:<br/>- Nullifier (anonym, eindeutig)<br/>- Ausstelldatum<br/>- Name Volksbegehren<br/>- Gültig bis (Laufzeit)<br/>- Amtsstelle (BFS-Nummer/DID)
            Issuer->>Issuer: Signiert Credential (ECDSA P-256)
            Issuer->>Portal: Gibt Credential Offer zurück (OID4VCI)
            Portal->>User: Zeigt QR-Code für Credential-Empfang
            User->>Wallet: Scannt QR-Code
            Wallet->>Issuer: Fordert Credential an (Authorization)
            Issuer->>Wallet: Stellt Stimmrechtsausweis aus (SD-JWT VC)
            Wallet->>Wallet: Speichert Credential mit Nullifier sicher
            Wallet-->>User: Bestätigt Import des Stimmrechtsausweises
            
            Note over User,DB: Phase 5: Unterschrift sammeln (später, beim Unterschreiben)
            
            User->>Verifier: Möchte für Volksbegehren unterschreiben
            Verifier->>User: Zeigt QR-Code (OID4VP)
            User->>Wallet: Scannt QR-Code
            Wallet->>Verifier: Präsentiert Stimmrechtsausweis
            Wallet->>Wallet: Erstellt kryptografische Signatur mit privatem Schlüssel
            Wallet->>Verifier: Übermittelt: Nullifier + Public Signature + Timestamp
            Verifier->>Verifier: Verifiziert kryptografische Signatur gegen Base Registry
            Verifier->>DB: Speichert Signature-File (anonym):<br/>- Nullifier<br/>- Public Signature (ECDSA)<br/>- Timestamp<br/>- Initiative-ID
            Note over DB: Kein Name, keine PII!<br/>Nur kryptografische Beweise
            Verifier-->>Wallet: Trigger für Quittungs-VC
            Issuer->>Wallet: Stellt Quittungs-VC aus
            Wallet-->>User: Unterschrift erfolgreich gespeichert
            
        else Stimmrechtsausweis nicht ausstellen
            Issuer-->>Portal: Anfrage für Stimmrechtsausweis-Credential ablehnen
            Portal-->>User: Zeigt Ablehnungsmeldung
        end

    else Bürger ist nicht stimmberechtigt
        Gemeinde-->>Portal: Berechtigung verweigert
        Portal-->>User: Zeigt Ablehnungsmeldung
    end
```
---

## Lizenz

Dieses Werk ist lizenziert unter der [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
