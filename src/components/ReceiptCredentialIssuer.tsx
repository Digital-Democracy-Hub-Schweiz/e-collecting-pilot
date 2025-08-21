import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { verificationBusinessAPI } from "@/services/verificationAPI";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { ShieldCheck, QrCode, RefreshCw, Share2 } from "lucide-react";
import volksbegehren from "@/data/volksbegehren.json";
type Option = {
  id: string;
  title: string;
};
export function ReceiptCredentialIssuer({
  preselect
}: {
  preselect?: {
    type: "Initiative" | "Referendum";
    id: string;
  };
}) {
  const {
    toast
  } = useToast();
  const [type, setType] = useState<"Initiative" | "Referendum" | "">("");
  const [selectedId, setSelectedId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [signDate, setSignDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [statusListUrl, setStatusListUrl] = useState("https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/3e6fc90b-bb80-4112-aa4e-940cda4616d7.jwt");
  const [isIssuing, setIsIssuing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [municipalityDetails, setMunicipalityDetails] = useState<{
    town: string;
    canton: string;
    bfs: string;
  } | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);
  const [isPollingVerification, setIsPollingVerification] = useState(false);
  const [acceptedLegalNotice, setAcceptedLegalNotice] = useState(false);

  // Vorbelegung via URL
  useEffect(() => {
    if (preselect?.type) {
      setType(preselect.type);
      if (preselect.id) setSelectedId(preselect.id);
    }
  }, [preselect]);
  // Normalisierte Liste aus volksbegehren.json ableiten
  const normalized = useMemo(() => {
    return (volksbegehren as any[]).map((item, idx) => {
      const title: string = item?.title ?? "";
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const id = slug || String(idx + 1);
      const type = String(item?.type ?? "").toLowerCase() === "referendum" ? "Referendum" : "Initiative";
      return {
        id,
        slug,
        type,
        title
      };
    });
  }, []);
  const options: Option[] = useMemo(() => {
    if (!type) return [];
    return normalized
      .filter(i => i.type === type)
      .map(({ id, title }) => ({ id, title }));
  }, [type, normalized]);
  const handleIssue = async (credentialData?: {
    given_name?: string;
    family_name?: string;
    birth_date?: string;
  }) => {
    const currentFirstName = credentialData?.given_name || firstName;
    const currentLastName = credentialData?.family_name || lastName;
    const currentBirthDate = credentialData?.birth_date || birthDate;
    if (!type || !selectedId || !currentFirstName || !currentLastName) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte Typ, Titel, Vor- und Nachname ausfüllen.",
        variant: "destructive"
      });
      return;
    }
    setIsIssuing(true);
    setStatusResult(null);
    try {
      const list = normalized.filter(i => i.type === type).map(({ id, title }) => ({ id, title }));
      const selected = list.find(o => o.id === selectedId);
      const selectedTitle = selected?.title || "";
      const payload = {
        metadata_credential_supported_id: ["e-collecting-pilot-receipt"],
        credential_subject_data: {
          firstName: currentFirstName || "Wilhelm",
          lastName: currentLastName || "Tell",
          birthDate: currentBirthDate || "12.09.1848",
          signDate: new Date().toISOString().slice(0, 10),
          type,
          title: selectedTitle
        },
        offer_validity_seconds: 86400,
        credential_valid_from: new Date().toISOString(),
        credential_valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status_lists: statusListUrl ? [statusListUrl] : undefined
      };
      const res = await issuerBusinessAPI.issueCredential(payload);
      setIssuedId(res.id || (res as any).management_id || null);
      setOfferDeeplink(res.offer_deeplink || null);
      toast({
        title: "Credential erstellt",
        description: `ID: ${res.id || (res as any).management_id}`
      });

      // Set the verified data in state for summary display
      if (credentialData) {
        setFirstName(credentialData.given_name || firstName);
        setLastName(credentialData.family_name || lastName);
        setBirthDate(credentialData.birth_date || birthDate);
      }
      if (municipalityDetails) {
        const {
          town = "",
          canton = "",
          bfs = ""
        } = municipalityDetails;
        toast({
          title: "Willensbekundung gesendet",
          description: `Die Willensbekundung wurde an ${town} ${canton} (BFS: ${bfs}) gesendet.`
        });
      }
    } catch (e: any) {
      toast({
        title: "Fehler beim Ausstellen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsIssuing(false);
    }
  };
  const handleNextFromStep1 = () => {
    if (!type || !selectedId) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte Typ und Titel auswählen.",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };
  const validateAddressInBackground = async () => {
    setIsValidatingAddress(true);
    try {
      if (!postalCode) throw new Error("PLZ fehlt");
      const resp = await fetch(`https://swisszip.api.ganti.dev/zip/${encodeURIComponent(postalCode)}`);
      if (!resp.ok) throw new Error(`PLZ-Abfrage fehlgeschlagen (${resp.status})`);
      const data = await resp.json();
      const items: any[] = Array.isArray(data) ? data : data?.results ?? data?.data ?? [];
      if (!Array.isArray(items) || items.length === 0) throw new Error("Keine Treffer für diese PLZ gefunden");
      const best: any = items.reduce((acc: any, cur: any) => {
        const shareAcc = Number(acc?.["zip-share"] ?? acc?.zip_share ?? acc?.zipShare ?? acc?.share ?? 0);
        const shareCur = Number(cur?.["zip-share"] ?? cur?.zip_share ?? cur?.zipShare ?? cur?.share ?? 0);
        return shareCur > shareAcc ? cur : acc;
      }, items[0]);
      const bfs = String(best?.bfs ?? best?.["bfs-number"] ?? best?.bfsNumber ?? "");
      const town = String(best?.town ?? best?.municipality ?? best?.place ?? best?.name ?? "");
      const canton = String(best?.canton ?? best?.cantonShort ?? best?.canton_abbr ?? "");
      setMunicipalityDetails({
        town,
        canton,
        bfs
      });
      setMunicipality(`${town} ${canton} ${bfs}`);
      toast({
        title: "Adresse geprüft",
        description: "Politische Gemeinde ermittelt."
      });
    } catch (e: any) {
      toast({
        title: "Adressprüfung fehlgeschlagen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };
  const handleNextFromStep2 = () => {
    if (!street || !houseNumber || !postalCode || !city) {
      toast({
        title: "Adresse unvollständig",
        description: "Bitte alle Adressfelder ausfüllen.",
        variant: "destructive"
      });
      return;
    }
    // Prüfung im Hintergrund starten und direkt zu Schritt 3 wechseln
    validateAddressInBackground();
    setStep(3);
  };
  const handleStartVerification = async () => {
    setIsCreatingVerification(true);
    try {
      const verification = await verificationBusinessAPI.createVerification();
      setVerificationId(verification.id);
      setVerificationUrl(verification.verification_url);
      setStep(4);
      // Start polling for verification result
      startPollingVerification(verification.id);
      toast({
        title: "Verifikation gestartet",
        description: "Scannen Sie den QR-Code mit Ihrer Swiyu-Wallet App."
      });
    } catch (e: any) {
      toast({
        title: "Verifikation fehlgeschlagen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsCreatingVerification(false);
    }
  };
  const startPollingVerification = (verificationId: string) => {
    setIsPollingVerification(true);
    const pollInterval = setInterval(async () => {
      try {
        const result = await verificationBusinessAPI.getVerification(verificationId);
        if (result.state === 'SUCCESS' && result.wallet_response) {
          clearInterval(pollInterval);
          setIsPollingVerification(false);

          // Extract data from wallet response
          const credentialData = result.wallet_response?.credential_subject_data;
          if (credentialData) {
            setFirstName(credentialData.given_name || "");
            setLastName(credentialData.family_name || "");
            setBirthDate(credentialData.birth_date || "");
          }
          toast({
            title: "Identität erfolgreich verifiziert",
            description: "Daten wurden übernommen."
          });

          // Automatically issue the credential with the verified data
          handleIssue(credentialData);
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
          setIsPollingVerification(false);
          toast({
            title: "Verification fehlgeschlagen",
            description: "Bitte versuchen Sie es erneut.",
            variant: "destructive"
          });
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPollingVerification(false);
    }, 300000);
  };
  const handleCheckStatus = async () => {
    if (!issuedId) return;
    setIsChecking(true);
    try {
      const res = await issuerBusinessAPI.checkCredentialStatus(issuedId);
      setStatusResult(res);
      toast({
        title: "Status abgefragt",
        description: "Statusinformationen aktualisiert."
      });
    } catch (e: any) {
      toast({
        title: "Statusabfrage fehlgeschlagen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };
  const handleShare = async () => {
    try {
      if (!type || !selectedId) return;
      const selected = normalized.find(o => o.type === type && o.id === selectedId);
      const title = selected?.title || (type === "Initiative" ? "Initiative" : "Referendum");
      const path = `/volksbegehren/${selected?.slug || selectedId}`;
      const url = `${window.location.origin}${path}`;
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Unterstütze: ${title}`,
          url
        });
        toast({
          title: "Geteilt",
          description: "Freigabedialog geöffnet."
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link kopiert",
          description: url
        });
      }
    } catch (e: any) {
      toast({
        title: "Teilen fehlgeschlagen",
        description: e?.message ?? "Unbekannter Fehler",
        variant: "destructive"
      });
    }
  };
  const resetForm = () => {
    setType("");
    setSelectedId("");
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setSignDate(new Date().toISOString().slice(0, 10));
    setStreet("");
    setHouseNumber("");
    setPostalCode("");
    setCity("");
    setStatusListUrl("https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/df7f2a3d-86bc-4002-aa81-9e147f340453.jwt");
    setIsIssuing(false);
    setIsChecking(false);
    setIssuedId(null);
    setOfferDeeplink(null);
    setStatusResult(null);
    setStep(1);
    setIsValidatingAddress(false);
    setMunicipality(null);
    setMunicipalityDetails(null);
    setVerificationId(null);
    setVerificationUrl(null);
    setIsCreatingVerification(false);
    setIsPollingVerification(false);
    setAcceptedLegalNotice(false);
    toast({
      title: "Zurückgesetzt",
      description: "Formular wurde geleert."
    });
  };
  return <section aria-labelledby="issuer-section" className="bg-white border border-gray-200 rounded-lg">
      <div className="p-8 space-y-6">
        <div className="space-y-6">
          <h1 id="issuer-section" className="text-3xl font-bold text-gray-900 leading-tight">
            Volksbegehren elektronisch unterstützen
          </h1>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Das elektronische Sammeln von Unterschriften (E-Collecting) ermöglicht es Bürgerinnen und 
              Bürgern, digitale Unterschriften für Volksinitiativen und Referenden zu leisten.
            </p>
            <p className="text-lg">Unterstützen Sie ein Volksbegehren sicher und einfach mit der Beta-ID des Bundes. </p>
          </div>
        </div>

        {/* Action buttons matching screenshot style */}
        

        <div className="space-y-6 pt-8 border-t border-gray-200">
          {/* Success message spans full width */}
          {step === 4 && issuedId && <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">Erfolgreich unterstützt!</h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Sie haben erfolgreich die {type} "{options.find(o => o.id === selectedId)?.title}" unterstützt.
                </p>
                <p className="text-xs text-green-700">
                  Ihre Willensbekundung wurde digital erfasst und an die zuständige politische Gemeinde übermittelt.
                </p>
              </div>
            </div>}

          <div className={cn("grid gap-6", issuedId ? "md:grid-cols-2" : "")}>
            <div className={cn("space-y-4", !issuedId && "md:max-w-2xl mx-auto")}>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Schritt {step} von 4</Badge>
              </div>

              {step === 1 && <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Typ wählen</Label>
                    <Select value={type} onValueChange={v => setType(v as any)}>
                      <SelectTrigger className="h-12 text-base" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Wählen Sie Initiative oder Referendum" />
                      </SelectTrigger>
                      <SelectContent className="z-[100] bg-background border shadow-lg">
                        <SelectItem value="Initiative" className="text-base py-3">Initiative</SelectItem>
                        <SelectItem value="Referendum" className="text-base py-3">Referendum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Volksbegehren auswählen</Label>
                    <Select value={selectedId} onValueChange={setSelectedId} disabled={!type}>
                      <SelectTrigger className="h-12 text-base" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder={type ? "Titel auswählen" : "Zuerst Typ wählen"} />
                      </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-auto z-[100] bg-background border shadow-lg w-full min-w-[300px]">
                  {options.map(o => <SelectItem key={o.id} value={o.id} className="text-sm py-3 leading-relaxed">
                      {o.title}
                    </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <button onClick={handleNextFromStep1} className="w-full inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base">
                      Weiter
                    </button>
                  </div>
                </div>}

              {step === 2 && <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Adresse eingeben</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Strasse</Label>
                          <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="z.B. Bahnhofstrasse" className="h-12 text-base" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Hausnummer</Label>
                          <Input value={houseNumber} onChange={e => setHouseNumber(e.target.value)} placeholder="z.B. 10A" className="h-12 text-base" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Postleitzahl</Label>
                          <Input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="z.B. 8001" className="h-12 text-base" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Ort</Label>
                          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="z.B. Zürich" className="h-12 text-base" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button onClick={() => setStep(1)} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base">
                      Zurück
                    </button>
                    <button onClick={handleNextFromStep2} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base flex-1" disabled={isValidatingAddress}>
                      {isValidatingAddress && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} 
                      Weiter
                    </button>
                  </div>
                </div>}

              {step === 3 && <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Übersicht Ihrer Angaben</h3>
                    
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Volksbegehren</Label>
                        <p className="text-sm">
                          {type} - {options.find(o => o.id === selectedId)?.title}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                        <p className="text-sm">
                          {street} {houseNumber}<br />
                          {postalCode} {city}
                        </p>
                      </div>

                      {municipality && <div>
                          <Label className="text-sm font-medium text-muted-foreground">Politische Gemeinde</Label>
                          <p className="text-sm text-primary font-medium">
                            {municipality}
                            {isValidatingAddress && <RefreshCw className="w-3 h-3 ml-2 inline animate-spin" />}
                          </p>
                        </div>}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/20">
                      <Checkbox id="legal-notice" checked={acceptedLegalNotice} onCheckedChange={checked => setAcceptedLegalNotice(checked === true)} className="mt-1" />
                      <Label htmlFor="legal-notice" className="text-sm leading-relaxed cursor-pointer">
                        Wer bei einer Unterschriftensammlung besticht oder sich bestechen lässt oder wer das Ergebnis einer Unterschriftensammlung für eine Volksinitiative fälscht, macht sich strafbar nach Art. 281 beziehungsweise nach Art. 282 des Strafgesetzbuches.
                      </Label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setStep(2)} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base">
                        Zurück
                      </button>
                      <button onClick={handleStartVerification} disabled={!acceptedLegalNotice || isCreatingVerification || isValidatingAddress} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                        {isCreatingVerification && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        Volksbegehren unterstützen
                      </button>
                    </div>
                  </div>
                </div>}

              {step === 4 && !issuedId && <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Verifikation mit Swiyu-Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      Scannen Sie den QR-Code mit Ihrer Swiyu-Wallet App um Ihre Identität zu verifizieren.
                    </p>

                    {verificationUrl && <div className="space-y-4">
                        <div className="bg-background p-6 rounded border flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={verificationUrl} size={192} />
                          <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline break-all">
                            {verificationUrl}
                          </a>
                        </div>

                        {isPollingVerification && <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Warten auf Verifikation der Identität mittels der Swiyu-Wallet App...
                          </div>}
                      </div>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button onClick={() => setStep(3)} disabled={isPollingVerification} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                      Zurück
                    </button>
                  </div>
                </div>}

              {step === 4 && issuedId && <div className="space-y-6">
                   <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                     <h4 className="font-semibold text-sm">Zusammenfassung Ihrer Angaben:</h4>
                     
                     <div className="grid gap-3 text-sm">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Datum:</span>
                         <span className="font-medium">{new Date().toLocaleDateString("de-CH")}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Uhrzeit:</span>
                         <span className="font-medium">{new Date().toLocaleTimeString("de-CH")}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Vorname:</span>
                         <span className="font-medium">{firstName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Nachname:</span>
                         <span className="font-medium">{lastName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Geburtsdatum:</span>
                         <span className="font-medium">{birthDate}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Adresse:</span>
                         <span className="font-medium">{street} {houseNumber}, {postalCode} {city}</span>
                       </div>
                       {municipalityDetails && <div className="flex justify-between">
                           <span className="text-muted-foreground">Politische Gemeinde:</span>
                           <span className="font-medium">{municipalityDetails.town} {municipalityDetails.canton} (BFS: {municipalityDetails.bfs})</span>
                         </div>}
                     </div>
                   </div>
                 </div>}
            </div>

            {issuedId && <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bestätigung:</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Eine Bestätigung kann mit der Swiyu-Wallet App heruntergeladen werden. Scannen Sie dazu den QR-Code mit Ihrere Swiyu-Wallet App.
                  </p>
                  <div className="space-y-4">
                    
                     {offerDeeplink && <div className="space-y-4">
                        <div className="bg-background p-4 rounded border flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={offerDeeplink} size={192} />
                          <a href={offerDeeplink} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                            In App öffnen
                          </a>
                        </div>
                      </div>}
                  </div>
                </div>
              </div>}
          </div>

          {/* Action buttons span full width below columns */}
          {step === 4 && issuedId && <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base">Neu starten</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Neustart bestätigen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dadurch werden alle Eingaben gelöscht. Möchten Sie fortfahren?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={resetForm}>Löschen und neu starten</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <button onClick={handleShare} className="inline-flex items-center justify-center px-6 py-3 text-[#13678A] border border-[#13678A] rounded hover:bg-[#13678A]/10 transition-colors font-medium h-12 text-base flex-1">
                <Share2 className="w-4 h-4 mr-2" /> Volksbegehren teilen
              </button>
            </div>}
        </div>
      </div>
    </section>;
}