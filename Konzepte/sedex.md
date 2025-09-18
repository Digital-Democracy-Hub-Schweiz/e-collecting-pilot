# Umsetzung einer Willensbekundung über die SEDEX‑Schnittstelle
Original mit Kommentarfunktion: [Google Docs](https://docs.google.com/document/d/1sW154f2RdD9syY5mu_LkxUkquaYUq4mMTWYrW7sLHTE/edit?usp=sharing)

## Bedeutung von SEDEX und eCH‑Standards

·      **sedex** ist die Plattform des Bundes für den verschlüsselten Datenaustausch. Sie läuft rund um die Uhr, verwendet die PKI des Bundes und generiert Quittungen für jede Nachricht[[1]](https://www.bk.admin.ch/bk/de/home/digitale-transformation-ikt-lenkung/e-services-bund/services/sicherer-datenaustausch-sedex.html#:~:text=sedex%20steht%20f%C3%BCr%20se%20cure,monisierung%20RH%29%20aufgebaut).

·      **eCH‑Standards** regeln den einheitlichen Datenaustausch. Im Bereich „Politische Rechte“ existieren Standards für Personenidentifikation, Stimm‑ und Wahlregister, Wahlvorlagen und Ergebnisse. Ein offizieller Standard für digitale Willensbekundungen (E‑Collecting) wurde noch nicht veröffentlicht[[2]](https://www.ech.ch/sites/default/files/veranstaltungen/beilage%202_jahresbericht%202024_1.pdf#:~:text=Seite%2036%20Geplante%20T%C3%A4tigkeiten%3A%20,Keine).

## Übersicht der relevanten eCH‑Standards

|Bereich|Standard|Relevanter Inhalt|Nutzung|
|---|---|---|---|
|**Personenidentifikation**|eCH‑0044|minimale Personendaten (z. B. AHVN13, Name, Vorname, Geburtsdatum)[[3]](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF_2014-04-02_eCH-0044_V4.1_Datenstandard%20Austausch%20von%20Personenidentifikationen.pdf#:~:text=2,deren%20Speicherung%20in%20registerf%C3%BChrenden%20Anwen)|Grundlage zur Identifikation des Unterzeichnenden|
|**Stimm- und Wahlregister**|eCH‑0045|Datenstrukturen und Ereignisse (addVoter, changeVotingRights, removeVoter)[[4]](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0045_V4.3.0_Datenstandard%20Stimm-%20und%20Wahlregister.pdf#:~:text=%E2%80%A2%20,ausschliesslich%20durch%20die%20Quellregister%20bestimmt)|Stimmberechtigung anhand des Registers prüfen|
|**Datenmodell politische Rechte**|eCH‑0155|Struktur votingPersonIdentification, mit localPersonId, optionaler AHVN13, Name, Geschlecht, Geburtsdatum; Codes für Stimmberechtigten‑Typ und Stimmkanal[[5]](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0155_V4.3.0_Datenstandard%20politische%20Rechte.pdf#:~:text=votingPersonIdentification%20Definition%3A%20%E2%80%A2%20AHVN13%20,0044%3AdatePartiallyKnownType)|Person im Payload eindeutig identifizieren|
|**sedex‑Umschlag**|eCH‑0090|definiert Felder wie messageId, messageType, messageClass, senderId, recipientId, eventDate, messageDate[[6]](https://docs.sedex.admin.ch/reference/sedex-envelope/#:~:text=,when%20the%20message%20was%20created)|Umschlag für jede sedex‑Nachricht; messageType für Willensbekundung vereinbaren|
|**Abstimmungs-/Wahlvorlagen, Ergebnisse**|eCH‑0157, eCH‑0159, eCH‑0252, eCH‑0110|Strukturen für Wahlvorschläge und Abstimmungsergebnisse (z. B. voteIdentification)[[7]](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF-2022-11-18_eCH-0252_V1.0.0_Schnittstellenstandard_voteinfo.pdf#:~:text=Zusammenfassung%20Der%20vorliegende%20Standard%20definiert,der%20%C3%9Cbermittlung%20von%20Abstimmungsresultaten%20an)|Können zur Identifikation des Geschäfts genutzt werden, aber nicht für Unterschriften|

## Umsetzungsschritte für eine digitale Willensbekundung

1.  **sedex‑Teilnehmer werden**

2. Vertrag mit dem BFS abschliessen; sedex‑ID und Zertifikat erhalten.

3. sedex‑Client (Server oder Docker) installieren und konfigurieren.
4. **Umschlag nach eCH‑0090 erstellen**

5. messageId (einzigartig), messageType (Wert mit Empfänger vereinbaren), messageClass (0 = Erstmeldung), senderId, recipientId, eventDate, messageDate füllen[[6]](https://docs.sedex.admin.ch/reference/sedex-envelope/#:~:text=,when%20the%20message%20was%20created).

6. Beispiel:

```xml
<envelope xmlns="http://www.ech.ch/xmlns/eCH-0090/1" version="1.0">
  <messageId>123e4567-e89b-12d3-a456-426614174000</messageId>
  <messageType>99</messageType>
  <messageClass>0</messageClass>
  <senderId>1-1234-1</senderId>
  <recipientId>3-CH-1</recipientId>
  <eventDate>2025-09-16T10:00:00</eventDate>
  <messageDate>2025-09-16T10:01:00</messageDate>
</envelope>
```

1.        **Payload mit Willensbekundung definieren**

2.        Schema entwerfen (XML/JSON) und am votingPersonIdentification aus eCH‑0155 orientieren.

3.        Initiative/Referendum durch voteIdentification oder eindeutige ID kennzeichnen.

4.        Angaben zur Unterschrift (Datum, Signaturverfahren) erfassen.

5.        Payload‑Datei muss mit data_ beginnen; alle Formate sind zulässig (XML, JSON, PDF usw.)[[8]](https://docs.sedex.admin.ch/reference/sedex-payload/#:~:text=All%20file%20formats%20are%20supported,data%20in%20formats%20such%20as).

6. sedex verschlüsselt die Payload automatisch[[9]](https://docs.sedex.admin.ch/reference/sedex-payload/#:~:text=The%20payload%20is%20encrypted%20by,decrypt%20and%20read%20the%20data).
7. **Versand und Quittungen**

8.        Umschlag und Payload im outbox‑Verzeichnis des sedex‑Clients speichern oder via REST‑API senden.

9.        Quittungen analysieren; bei mehreren Empfängern wird die Nachricht abgelehnt, wenn einer nicht autorisiert ist[[10]](https://docs.sedex.admin.ch/reference/sedex-envelope/#:~:text=Sending%20a%20Message%20to%20Multiple,Recipients).

10. Gemeinde kann mit einer Antwortnachricht (messageClass = 1) reagieren.
11. **Prüfung der Stimmberechtigung**

12.  Die Gemeinde liest die Payload, verifiziert die Signatur und vergleicht die Personendaten mit dem Stimm‑ und Wahlregister (eCH‑0045)[[4]](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0045_V4.3.0_Datenstandard%20Stimm-%20und%20Wahlregister.pdf#:~:text=%E2%80%A2%20,ausschliesslich%20durch%20die%20Quellregister%20bestimmt).

13.  Nicht stimmberechtigte oder doppelte Einträge werden zurückgewiesen.

## Aktueller Stand und Hinweise

·      Ein offizieller eCH‑Standard für E‑Collecting existiert noch nicht[[2]](https://www.ech.ch/sites/default/files/veranstaltungen/beilage%202_jahresbericht%202024_1.pdf#:~:text=Seite%2036%20Geplante%20T%C3%A4tigkeiten%3A%20,Keine); die hier vorgeschlagene Struktur dient als pragmatische Übergangslösung.

·      Der Kanton St. Gallen plant 2026 ein Pilotprojekt für E‑Collecting mit AGov‑Authentifikation und automatischem Abgleich mit dem Wahlregister[[11]](https://www.inside-it.ch/als-erster-kanton-startet-st-gallen-wohl-bald-mit-e-collecting-20250204#:~:text=,Die%20Technologie%20kommt%20von%20Abraxas).

·      Beteiligung an den eCH‑Fachgruppen „Politische Rechte“ oder „Politische Geschäfte“ kann helfen, zukünftige Standards mitzugestalten.

·      Rechtliche Anforderungen (Signaturgesetz, Datenschutz) müssen beachtet werden.

---

[[1]](https://www.bk.admin.ch/bk/de/home/digitale-transformation-ikt-lenkung/e-services-bund/services/sicherer-datenaustausch-sedex.html#:~:text=sedex%20steht%20f%C3%BCr%20se%20cure,monisierung%20RH%29%20aufgebaut) Sicherer Datenaustausch (sedex)

[https://www.bk.admin.ch/bk/de/home/digitale-transformation-ikt-lenkung/e-services-bund/services/sicherer-datenaustausch-sedex.html](https://www.bk.admin.ch/bk/de/home/digitale-transformation-ikt-lenkung/e-services-bund/services/sicherer-datenaustausch-sedex.html)

[[2]](https://www.ech.ch/sites/default/files/veranstaltungen/beilage%202_jahresbericht%202024_1.pdf#:~:text=Seite%2036%20Geplante%20T%C3%A4tigkeiten%3A%20,Keine) Verein eCH: Jahresbericht 2024

[https://www.ech.ch/sites/default/files/veranstaltungen/beilage%202_jahresbericht%202024_1.pdf](https://www.ech.ch/sites/default/files/veranstaltungen/beilage%202_jahresbericht%202024_1.pdf)

[[3]](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF_2014-04-02_eCH-0044_V4.1_Datenstandard%20Austausch%20von%20Personenidentifikationen.pdf#:~:text=2,deren%20Speicherung%20in%20registerf%C3%BChrenden%20Anwen)

[https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF_2014-04-02_eCH-0044_V4.1_Datenstandard%20Austausch%20von%20Personenidentifikationen.pdf](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF_2014-04-02_eCH-0044_V4.1_Datenstandard%20Austausch%20von%20Personenidentifikationen.pdf)

[[4]](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0045_V4.3.0_Datenstandard%20Stimm-%20und%20Wahlregister.pdf#:~:text=%E2%80%A2%20,ausschliesslich%20durch%20die%20Quellregister%20bestimmt) eCH-0045 – Schnittstellenstandard Stimm- und Wahlre-gister

[https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0045_V4.3.0_Datenstandard%20Stimm-%20und%20Wahlregister.pdf](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0045_V4.3.0_Datenstandard%20Stimm-%20und%20Wahlregister.pdf)

[[5]](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0155_V4.3.0_Datenstandard%20politische%20Rechte.pdf#:~:text=votingPersonIdentification%20Definition%3A%20%E2%80%A2%20AHVN13%20,0044%3AdatePartiallyKnownType) eCH-0155 – Datenstandard politische Rechte

[https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0155_V4.3.0_Datenstandard%20politische%20Rechte.pdf](https://www.ech.ch/sites/default/files/imce/eCH-Dossier/eCH-Dossier_PDF_Publikationen/Hauptdokument/STAN_d_DEF_2025-06-25_eCH-0155_V4.3.0_Datenstandard%20politische%20Rechte.pdf)

[[6]](https://docs.sedex.admin.ch/reference/sedex-envelope/#:~:text=,when%20the%20message%20was%20created) [[10]](https://docs.sedex.admin.ch/reference/sedex-envelope/#:~:text=Sending%20a%20Message%20to%20Multiple,Recipients) sedex Envelope Format - Technical user documentation for the sedex-Client

[https://docs.sedex.admin.ch/reference/sedex-envelope/](https://docs.sedex.admin.ch/reference/sedex-envelope/)

[[7]](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF-2022-11-18_eCH-0252_V1.0.0_Schnittstellenstandard_voteinfo.pdf#:~:text=Zusammenfassung%20Der%20vorliegende%20Standard%20definiert,der%20%C3%9Cbermittlung%20von%20Abstimmungsresultaten%20an) eCH-0252 – Schnittstellenstandard Voteinfo

[https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF-2022-11-18_eCH-0252_V1.0.0_Schnittstellenstandard_voteinfo.pdf](https://www.ech.ch/sites/default/files/dosvers/hauptdokument/STAN_d_DEF-2022-11-18_eCH-0252_V1.0.0_Schnittstellenstandard_voteinfo.pdf)

[[8]](https://docs.sedex.admin.ch/reference/sedex-payload/#:~:text=All%20file%20formats%20are%20supported,data%20in%20formats%20such%20as) [[9]](https://docs.sedex.admin.ch/reference/sedex-payload/#:~:text=The%20payload%20is%20encrypted%20by,decrypt%20and%20read%20the%20data) sedex Payload Format - Technical user documentation for the sedex-Client

[https://docs.sedex.admin.ch/reference/sedex-payload/](https://docs.sedex.admin.ch/reference/sedex-payload/)

[[11]](https://www.inside-it.ch/als-erster-kanton-startet-st-gallen-wohl-bald-mit-e-collecting-20250204#:~:text=,Die%20Technologie%20kommt%20von%20Abraxas) Als erster Kanton startet St. Gallen wohl bald mit E-Collecting

[https://www.inside-it.ch/als-erster-kanton-startet-st-gallen-wohl-bald-mit-e-collecting-20250204](https://www.inside-it.ch/als-erster-kanton-startet-st-gallen-wohl-bald-mit-e-collecting-20250204)