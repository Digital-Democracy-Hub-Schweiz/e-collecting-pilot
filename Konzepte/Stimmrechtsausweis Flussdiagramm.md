flowchart TD
    Start([Bürger startet Prozess]) --> Adresse[Wohnadresse eingeben]
    Adresse --> AdressCheck{Adresse<br/>gültig?}
    AdressCheck -->|Ja| Gemeinde[Gemeinde ermittelt<br/>via BFS-Nummer]
    AdressCheck -->|Nein| Fehler1[Fehlermeldung]
    
    Gemeinde --> QR1[QR-Code scannen]
    QR1 --> Ident[Identitätsdaten übermitteln<br/>Vorname, Nachname, Geburtsdatum]
    
    Ident --> Prüfung{Stimm-<br/>berechtigt?}
    Prüfung -->|Nein| Fehler2[Zugriff verweigert]
    Prüfung -->|Ja| Liste[Liste Volksbegehren anzeigen]
    
    Liste --> Auswahl[Volksbegehren auswählen]
    Auswahl --> QR2[QR-Code scannen]
    QR2 --> Import[Stimmrechtsausweis<br/>in Wallet importieren]
    Import --> Ende([Prozess abgeschlossen])
    
    Fehler1 --> Ende
    Fehler2 --> Ende
    
    style Start fill:#e1f5e1
    style Ende fill:#e1f5e1
    style Fehler1 fill:#ffe1e1
    style Fehler2 fill:#ffe1e1
    style QR1 fill:#fff4e1
    style QR2 fill:#fff4e1
    style Import fill:#e1e5ff

---

## Lizenz

Dieses Werk ist lizenziert unter der [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).