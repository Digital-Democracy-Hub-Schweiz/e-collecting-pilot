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
    "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/1fa132d3-e95b-4d41-8eec-320a02df428f.jwt"
  );
  const [isIssuing, setIsIssuing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [municipalityDetails, setMunicipalityDetails] = useState<{ town: string; canton: string; bfs: string } | null>(null);

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
          firstName,
          lastName,
          birthDate
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
    toast({ title: "Zurückgesetzt", description: "Formular wurde geleert." });
  };

  return (
    <section aria-labelledby="issuer-section">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle id="issuer-section" className="flex items-center gap-2">
            Volksbegehren elektronisch unterstützen
          </CardTitle>
          <CardDescription>Unterstützen Sie ein Volksbegehren elektronisch und erhalten Sie einen digitalen Beleg als Bestätigung.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={cn("grid gap-6", issuedId ? "md:grid-cols-2" : "")}>
            <div className={cn("space-y-4", !issuedId && "md:max-w-2xl mx-auto")}> 
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Schritt {step} von 3</Badge>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie Initiative oder Referendum" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="Initiative">Initiative</SelectItem>
                        <SelectItem value="Referendum">Referendum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Select value={selectedId} onValueChange={setSelectedId} disabled={!type}>
                      <SelectTrigger>
                        <SelectValue placeholder={type ? "Titel auswählen" : "Zuerst Typ wählen"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-auto z-50">
                        {options.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleNextFromStep1} className="min-w-[160px]">Weiter</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Strasse</Label>
                      <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="z.B. Bahnhofstrasse" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hausnummer</Label>
                      <Input value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="z.B. 10A" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Postleitzahl</Label>
                      <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="z.B. 8001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ort</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="z.B. Zürich" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setStep(1)}>Zurück</Button>
                    <Button onClick={handleNextFromStep2} className="min-w-[160px]" disabled={isValidatingAddress}>
                      {isValidatingAddress && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Weiter
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vorname</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="z.B. Maria" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nachname</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="z.B. Muster" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Geburtsdatum</Label>
                      <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Datum der Willensbekundung</Label>
                      <Input readOnly type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2 hidden">
                    <Label>Status-List URL (optional)</Label>
                    <Input readOnly value={statusListUrl} onChange={(e) => setStatusListUrl(e.target.value)} placeholder="https://.../statuslist/xyz.jwt" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {!issuedId ? (
                      <Button variant="secondary" onClick={() => setStep(2)}>Zurück</Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary">Neu starten</Button>
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
                    {!issuedId ? (
                      <Button onClick={handleIssue} disabled={isIssuing} className="min-w-[200px]">
                        {isIssuing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} Willensbekundung abschliessen
                      </Button>
                    ) : (
                      <Button onClick={handleShare}>
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
                        <div className="bg-background p-4 rounded border flex items-center justify-center">
                          <QRCode value={offerDeeplink} size={192} />
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
