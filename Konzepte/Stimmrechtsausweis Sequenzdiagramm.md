# E-Collecting mit swiyu E-ID (SSI-basiert)

## 1. Zielsetzung
E-Collecting ermöglicht es Bürger:innen, mit Hilfe der
SSI-basierten **swiyu E-ID App** ihre Stimmberechtigung nachzuweisen und
Willensbekundungen **fälschungssicher, anonym und einmalig** für ein
konkretes Volksbegehren abzugeben.

---

sequenceDiagram
    actor User as Bürger
    participant Portal as E-Collecting Portal
    participant Addr as Adressservice
    participant Gemeinde as Gemeinde System
    participant Wallet as Swiyu Wallet
    participant Issuer as Generic Issuer (Gemeinde)

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
        
        Note over User,Issuer: Phase 4: Credential-Ausstellung
        
        Portal->>Issuer: Fordert Stimmrechtsausweis-Credential an
        
        
        alt Stimmrechtsausweis ausstellen    
            Issuer->>Issuer: Erstellt Credential mit:<br/>- Nullifier (Bürger+Volksbegehren+Secret)<br/>- Ausstelldatum<br/>- Name Volksbegehren<br/>- Gültig bis (Laufzeit)<br/>- Amtsstelle (BFS-Nummer/DID)
            Issuer->>Issuer: Signiert Credential (ECDSA)
            Issuer->>Portal: Gibt Credential Offer zurück
            Portal->>User: Zeigt QR-Code (OID4VCI)
            User->>Wallet: Scannt QR-Code
            Wallet->>Issuer: Fordert Credential an (Authorization)
            Issuer->>Wallet: Stellt Stimmrechtsausweis aus (SD-JWT VC)
            Wallet->>Wallet: Speichert Credential sicher
            Wallet-->>User: Bestätigt Import des Stimmrechtsausweises
        else Stimmrechtsausweis nicht ausstellen
            Issuer-->>Portal: Anfrage für Stimmrechtsausweis-Credential ablehnen
            Portal-->>User: Zeigt Ablehnungsmeldung
        end


    else Bürger ist nicht stimmberechtigt
        Gemeinde-->>Portal: Berechtigung verweigert
        Portal-->>User: Zeigt Ablehnungsmeldung
    end

---

## Lizenz

Dieses Werk ist lizenziert unter der [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).