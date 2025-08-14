import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { verificationBusinessAPI } from "@/services/verificationAPI";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { ShieldCheck, QrCode, RefreshCw, Share2 } from "lucide-react";

import initiatives from "@/data/initiatives.json";
import referendums from "@/data/referendums.json";

type Option = { id: string; title: string };

export function ReceiptCredentialIssuer({ preselect }: { preselect?: { type: "Initiative" | "Referendum"; id: string } }) {
  const { toast } = useToast();
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
  const [statusListUrl, setStatusListUrl] = useState(
    "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/be2d22d7-2258-481f-b905-6f1697258d22.jwt"
  );
  const [isIssuing, setIsIssuing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [municipalityDetails, setMunicipalityDetails] = useState<{ town: string; canton: string; bfs: string } | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);
  const [isPollingVerification, setIsPollingVerification] = useState(false);

  // Vorbelegung via URL
  useEffect(() => {
    if (preselect?.type) {
      setType(preselect.type);
      if (preselect.id) setSelectedId(preselect.id);
    }
  }, [preselect]);

  const options: Option[] = useMemo(() => (type === "Initiative" ? (initiatives as Option[]) : (referendums as Option[])), [type]);

  const handleIssue = async () => {
    if (!type || !selectedId || !firstName || !lastName) {
      toast({ title: "Fehlende Angaben", description: "Bitte Typ, Titel, Vor- und Nachname ausfüllen.", variant: "destructive" });
      return;
    }

    setIsIssuing(true);
    setStatusResult(null);
    try {
      const list = (type === "Initiative" ? (initiatives as Option[]) : (referendums as Option[]));
      const selected = list.find((o) => o.id === selectedId);
      const selectedTitle = selected?.title || "";

      const payload = {
        metadata_credential_supported_id: ["my-test-vc"],
        credential_subject_data: {
          firstName: firstName || "Wilhelm",
          lastName: lastName || "Tell",
          birthDate: birthDate || "12.09.1848"
        /*  signDate,
          type,
          title: selectedTitle*/
        },
        offer_validity_seconds: 86400,
        credential_valid_from: new Date().toISOString(),
        credential_valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status_lists: statusListUrl ? [statusListUrl] : undefined,
      };

      const res = await issuerBusinessAPI.issueCredential(payload);
      setIssuedId(res.id || (res as any).management_id || null);
      setOfferDeeplink(res.offer_deeplink || null);
      toast({ title: "Credential erstellt", description: `ID: ${res.id || (res as any).management_id}` });
      if (municipalityDetails) {
        const { town = "", canton = "", bfs = "" } = municipalityDetails;
        toast({
          title: "Willensbekundung gesendet",
          description: `Die Willensbekundung wurde an ${town} ${canton} ${bfs} gesendet.`,
        });
      }
    } catch (e: any) {
      toast({ title: "Fehler beim Ausstellen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleNextFromStep1 = () => {
    if (!type || !selectedId) {
      toast({ title: "Fehlende Angaben", description: "Bitte Typ und Titel auswählen.", variant: "destructive" });
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

      const items: any[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
      if (!Array.isArray(items) || items.length === 0) throw new Error("Keine Treffer für diese PLZ gefunden");

      const best: any = items.reduce((acc: any, cur: any) => {
        const shareAcc = Number(acc?.["zip-share"] ?? acc?.zip_share ?? acc?.zipShare ?? acc?.share ?? 0);
        const shareCur = Number(cur?.["zip-share"] ?? cur?.zip_share ?? cur?.zipShare ?? cur?.share ?? 0);
        return shareCur > shareAcc ? cur : acc;
      }, items[0]);

      const bfs = String(best?.bfs ?? best?.["bfs-number"] ?? best?.bfsNumber ?? "");
      const town = String(best?.town ?? best?.municipality ?? best?.place ?? best?.name ?? "");
      const canton = String(best?.canton ?? best?.cantonShort ?? best?.canton_abbr ?? "");

      setMunicipalityDetails({ town, canton, bfs });
      setMunicipality(`${town} ${canton} ${bfs}`);
      toast({ title: "Adresse geprüft", description: "Politische Gemeinde ermittelt." });
    } catch (e: any) {
      toast({ title: "Adressprüfung fehlgeschlagen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleNextFromStep2 = () => {
    if (!street || !houseNumber || !postalCode || !city) {
      toast({ title: "Adresse unvollständig", description: "Bitte alle Adressfelder ausfüllen.", variant: "destructive" });
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
      toast({ title: "E-ID Verifikation gestartet", description: "Scannen Sie den QR-Code mit Ihrer Swiyu-Wallet App." });
    } catch (e: any) {
      toast({ title: "Verifikation fehlgeschlagen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
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
          const walletData = result.wallet_response;
          if (walletData?.credentialSubject) {
            setFirstName(walletData.credentialSubject.firstName || "");
            setLastName(walletData.credentialSubject.lastName || "");
            setBirthDate(walletData.credentialSubject.birthDate || "");
          }
          
          toast({ title: "E-ID erfolgreich verifiziert", description: "Daten wurden übernommen." });
          
          // Automatically issue the credential
          handleIssue();
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
          setIsPollingVerification(false);
          toast({ title: "Verification fehlgeschlagen", description: "Bitte versuchen Sie es erneut.", variant: "destructive" });
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
      toast({ title: "Status abgefragt", description: "Statusinformationen aktualisiert." });
    } catch (e: any) {
      toast({ title: "Statusabfrage fehlgeschlagen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!type || !selectedId) return;
      const list = (type === "Initiative" ? (initiatives as Option[]) : (referendums as Option[]));
      const selected = list.find((o) => o.id === selectedId);
      const title = selected?.title || (type === "Initiative" ? "Initiative" : "Referendum");
      const path = `/${type === "Initiative" ? "initiative" : "referendum"}/${selectedId}`;
      const url = `${window.location.origin}${path}`;

      if (navigator.share) {
        await navigator.share({ title: title, text: `Unterstütze: ${title}`, url });
        toast({ title: "Geteilt", description: "Freigabedialog geöffnet." });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link kopiert", description: url });
      }
    } catch (e: any) {
      toast({ title: "Teilen fehlgeschlagen", description: e?.message ?? "Unbekannter Fehler", variant: "destructive" });
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
    setStatusListUrl(
      "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/df7f2a3d-86bc-4002-aa81-9e147f340453.jwt"
    );
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
    toast({ title: "Zurückgesetzt", description: "Formular wurde geleert." });
  };

  return (
    <section aria-labelledby="issuer-section">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle id="issuer-section" className="flex items-center gap-2">
            Volksbegehren elektronisch unterstützen
          </CardTitle>
          <CardDescription>Unterstützen Sie ein Volksbegehren sicher und einfach mit der elektronischen Identität des Bundes. </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={cn("grid gap-6", issuedId ? "md:grid-cols-2" : "")}>
            <div className={cn("space-y-4", !issuedId && "md:max-w-2xl mx-auto")}> 
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Schritt {step} von 4</Badge>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Typ wählen</Label>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Wählen Sie Initiative oder Referendum" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border shadow-lg">
                        <SelectItem value="Initiative" className="text-base py-3">Initiative</SelectItem>
                        <SelectItem value="Referendum" className="text-base py-3">Referendum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Titel auswählen</Label>
                    <Select value={selectedId} onValueChange={setSelectedId} disabled={!type}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={type ? "Titel auswählen" : "Zuerst Typ wählen"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-auto z-50 bg-background border shadow-lg w-full min-w-[300px]">
                        {options.map((o) => (
                          <SelectItem key={o.id} value={o.id} className="text-sm py-3 leading-relaxed">
                            {o.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleNextFromStep1} className="w-full h-12 text-base font-semibold">
                      Weiter
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Adresse eingeben</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Strasse</Label>
                          <Input 
                            value={street} 
                            onChange={(e) => setStreet(e.target.value)} 
                            placeholder="z.B. Bahnhofstrasse" 
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Hausnummer</Label>
                          <Input 
                            value={houseNumber} 
                            onChange={(e) => setHouseNumber(e.target.value)} 
                            placeholder="z.B. 10A" 
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Postleitzahl</Label>
                          <Input 
                            value={postalCode} 
                            onChange={(e) => setPostalCode(e.target.value)} 
                            placeholder="z.B. 8001" 
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Ort</Label>
                          <Input 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            placeholder="z.B. Zürich" 
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="h-12 text-base">
                      Zurück
                    </Button>
                    <Button 
                      onClick={handleNextFromStep2} 
                      className="h-12 text-base font-semibold flex-1" 
                      disabled={isValidatingAddress}
                    >
                      {isValidatingAddress && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} 
                      Weiter
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
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

                      {municipality && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Politische Gemeinde</Label>
                          <p className="text-sm text-primary font-medium">
                            {municipality}
                            {isValidatingAddress && (
                              <RefreshCw className="w-3 h-3 ml-2 inline animate-spin" />
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="secondary" onClick={() => setStep(2)} className="h-12 text-base">
                      Zurück
                    </Button>
                    <Button 
                      onClick={handleStartVerification} 
                      disabled={isCreatingVerification || isValidatingAddress}
                      className="h-12 text-base font-semibold flex-1"
                    >
                      {isCreatingVerification && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      Volksbegehren unterstützen
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Verifikation mit Swiyu-Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      Scannen Sie den QR-Code mit Ihrer Swiyu-Wallet App um Ihre Identität zu verifizieren.
                    </p>

                    {verificationUrl && (
                      <div className="space-y-4">
                        <div className="bg-background p-6 rounded border flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={verificationUrl} size={192} />
                          <a
                            href={verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground underline break-all"
                          >
                            {verificationUrl}
                          </a>
                        </div>

                        
                        {isPollingVerification && (
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Warten auf E-ID Verification...
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 hidden">
                      <Label>Status-List URL (optional)</Label>
                      <Input readOnly value={statusListUrl} onChange={(e) => setStatusListUrl(e.target.value)} placeholder="https://.../statuslist/xyz.jwt" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {!issuedId ? (
                      <Button variant="secondary" onClick={() => setStep(3)} disabled={isPollingVerification} className="h-12 text-base">
                        Zurück
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" className="h-12 text-base">Neu starten</Button>
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
                    )}
                    {issuedId && (
                      <Button onClick={handleShare} className="h-12 text-base font-semibold flex-1">
                        <Share2 className="w-4 h-4 mr-2" /> Volksbegehren teilen
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {issuedId && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ergebnis</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span>Credential-ID:</span>
                      <Badge variant="outline" className="font-mono text-xs">{issuedId}</Badge>
                    </div>
                    
                      {offerDeeplink && (
                      <div className="space-y-4">
                        <div className="bg-background p-4 rounded border flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={offerDeeplink} size={192} />
                          <a
                            href={offerDeeplink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground underline break-all"
                          >
                            {offerDeeplink}
                          </a>
                        </div>
                        
                        <Accordion type="single" collapsible>
                          <AccordionItem value="deeplink">
                            <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                <QrCode className="w-4 h-4" />
                                <span>Deep Link Details</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3">
                                <div>
                                  <a href={offerDeeplink} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                                    In App öffnen
                                  </a>
                                </div>
                                <div className="bg-muted p-3 rounded">
                                  <code className="text-xs break-all">{offerDeeplink}</code>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <Button variant="secondary" onClick={handleCheckStatus} disabled={isChecking}>
                        {isChecking && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Status prüfen
                      </Button>
                      {statusResult?.status && (
                        <Badge variant="outline" className="text-xs">{String(statusResult.status)}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
