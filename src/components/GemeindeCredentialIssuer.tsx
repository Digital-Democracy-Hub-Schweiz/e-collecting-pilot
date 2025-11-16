import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ErrorBadge } from "@/components/ui/error-badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { verificationBusinessAPI } from "@/services/verificationAPI";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "react-qr-code";
import { AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { determineCantonFromBfs } from "@/utils/cantonUtils";
import { useTranslation } from 'react-i18next';
import { useCurrentLanguage, getLocalizedPath } from "@/utils/routing";
import { NativeAddressSearch } from "@/components/ui/native-address-search";
import { AddressHit } from "@/services/addressAPI";
import { createTitleVariants } from "@/lib/title-utils";

// Status-Anzeige Helper Funktion
const getStatusDisplay = (status: string | null) => {
  if (!status) return { text: 'Unbekannt', color: 'text-gray-500', bgColor: 'bg-gray-100' };
  
  switch (status) {
    case 'OFFERED':
      return { text: 'Angeboten', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    case 'CANCELLED':
      return { text: 'Abgebrochen', color: 'text-red-700', bgColor: 'bg-red-100' };
    case 'IN_PROGRESS':
      return { text: 'In Bearbeitung', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    case 'DEFERRED':
      return { text: 'Verschoben', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    case 'READY':
      return { text: 'Bereit', color: 'text-green-700', bgColor: 'bg-green-100' };
    case 'ISSUED':
      return { text: 'Ausgestellt', color: 'text-green-700', bgColor: 'bg-green-100' };
    case 'SUSPENDED':
      return { text: 'Gesperrt', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    case 'REVOKED':
      return { text: 'Widerrufen', color: 'text-red-700', bgColor: 'bg-red-100' };
    case 'EXPIRED':
      return { text: 'Abgelaufen', color: 'text-gray-700', bgColor: 'bg-gray-100' };
    default:
      return { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  }
};

// Hash-Funktion für Volksbegehren-ID
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Gemeinde Issuer API Service
const gemeindeIssuerAPI = {
  async issueStimmregisterCredential(payload: any) {
    const response = await fetch('https://issuer-stimmrecht.ecollecting.ch/management/api/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  async getCredentialStatus(credentialId: string) {
    const response = await fetch(`https://issuer-stimmrecht.ecollecting.ch/management/api/credentials/${credentialId}/status`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
};


type Option = {
  id: string;
  title: string;
};

export function GemeindeCredentialIssuer() {
  const { t } = useTranslation(['forms', 'errors', 'common']);
  const currentLang = useCurrentLanguage();
  const { volksbegehren } = useVolksbegehren();
  const statusListUrl = "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/82f80ac2-997c-4411-8e75-ee85f33f2e63.jwt";
  
  // Form state
  const [type, setType] = useState<"Initiative" | "Referendum" | "">("");
  const [selectedVolksbegehrenId, setSelectedVolksbegehrenId] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [flowAborted, setFlowAborted] = useState(false);

  // E-ID verification state
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);
  const [verifiedEIdData, setVerifiedEIdData] = useState<{
    given_name?: string;
    family_name?: string;
    birth_date?: string;
  } | null>(null);

  // Credential issuing state
  const [issuedCredentialId, setIssuedCredentialId] = useState<string | null>(null);
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [credentialStatus, setCredentialStatus] = useState<string | null>(null);

  // UI state
  const [municipalityDetails, setMunicipalityDetails] = useState<{
    town: string;
    canton: string;
    bfs: string;
    cantonFromBfs?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    type?: string;
    selectedVolksbegehrenId?: string;
    streetAddress?: string;
    postalCode?: string;
    city?: string;
  }>({});
  const [banner, setBanner] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const stepTitleRef = useRef<HTMLHeadingElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Normalisierte Volksbegehren-Liste
  const normalizedVolksbegehren = useMemo(() => {
    return volksbegehren.map((item, idx) => {
      const title: string = item?.title ?? "";
      const providedSlug: string = String(item?.slug || "").trim();
      const computedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = providedSlug || computedSlug;
      const id = item?.id || slug || String(idx + 1);
      const type = String(item?.type ?? "").toLowerCase() === "referendum" ? "Referendum" : "Initiative";
      return {
        id,
        slug,
        type,
        title,
        comitee: item?.comitee ?? null,
        level: item?.level ?? null,
        end_date: item?.end_date ?? null
      };
    });
  }, [volksbegehren]);

  // Automatisch E-ID Verifikation starten wenn Step 3 betreten wird
  useEffect(() => {
    if (step === 3 && !verificationUrl && !verifiedEIdData && !isCreatingVerification) {
      handleCreateEIdVerification();
    }
  }, [step]);

  // Status-Polling für ausgestellte Credentials
  useEffect(() => {
    if (!issuedCredentialId || step !== 5) return;

    const pollStatus = async () => {
      try {
        const statusResponse = await gemeindeIssuerAPI.getCredentialStatus(issuedCredentialId);
        setCredentialStatus(statusResponse.status);
      } catch (error) {
        console.error('Failed to fetch credential status:', error);
      }
    };

    // Initial status check
    pollStatus();

    // Poll status every 10 seconds
    const intervalId = setInterval(pollStatus, 10000);

    return () => clearInterval(intervalId);
  }, [issuedCredentialId, step]);

  const volksbegehrenOptions: Option[] = useMemo(() => {
    if (!type) return [];
    return normalizedVolksbegehren.filter(i => i.type === type).map(({
      id,
      title
    }) => ({
      id,
      title
    }));
  }, [type, normalizedVolksbegehren]);

  // Gefilterte Volksbegehren: keine Kanton/Ort-Filter mehr
  const filteredVolksbegehrenOptions: Option[] = useMemo(() => {
    if (!type) return [];
    return volksbegehrenOptions;
  }, [type, volksbegehrenOptions]);

  // Selected item for summary display
  const selectedItem = useMemo(() => {
    return normalizedVolksbegehren.find(o => o.type === type && o.id === selectedVolksbegehrenId) || null;
  }, [normalizedVolksbegehren, type, selectedVolksbegehrenId]);

  // Handler für Adressauswahl
  const handleAddressSelect = async (address: AddressHit) => {
    setStreetAddress(address.place.postalAddress.streetAddress);
    setPostalCode(address.place.postalAddress.postalCode);
    setCity(address.place.postalAddress.addressLocality);
    setFieldErrors(prev => ({ ...prev, streetAddress: undefined, postalCode: undefined, city: undefined }));
    
    const municipalityCode = address.place.additionalProperty.municipalityCode;
    const town = address.place.postalAddress.addressLocality;
    const canton = address.place.postalAddress.addressRegion || "";
    const bfs = municipalityCode;

    // Bestimme Kanton aus BFS-Code
    let cantonFromBfs = "";
    if (bfs && !isNaN(Number(bfs))) {
      try {
        cantonFromBfs = await determineCantonFromBfs(Number(bfs));
      } catch (error) {
        console.warn("Canton determination from BFS failed:", error);
        cantonFromBfs = canton;
      }
    }

    setMunicipalityDetails({
      town,
      canton,
      bfs,
      cantonFromBfs: cantonFromBfs || canton
    });
  };

  // Reset-Funktion für Neustart
  const handleResetFlow = () => {
    setType("");
    setSelectedVolksbegehrenId("");
    setStreetAddress("");
    setPostalCode("");
    setCity("");
    setStep(1);
    setFlowAborted(false);
    setVerificationUrl(null);
    setIsCreatingVerification(false);
    setVerifiedEIdData(null);
    setIssuedCredentialId(null);
    setOfferDeeplink(null);
    setCredentialStatus(null);
    setMunicipalityDetails(null);
    setFieldErrors({});
    setBanner(null);
    setShareModalOpen(false);
  };

  // Focus management
  useEffect(() => {
    if (step > 1) {
      requestAnimationFrame(() => {
        stepTitleRef.current?.focus();
      });
    }
  }, [step]);

  useEffect(() => {
    if (!banner) return;
    const isImportant = banner.type === 'error' || banner.type === 'warning';
    if (!isImportant) return;
    requestAnimationFrame(() => {
      if (bannerRef?.current) {
        try {
          bannerRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch (e) {
          // no-op
        }
        bannerRef.current.focus();
      }
    });
  }, [banner]);

  // Step 1: Adresse eingeben mit E-ID Verifikation
  const handleValidateAddress = () => {
    if (!streetAddress || !postalCode || !city) {
      const nextErrors: typeof fieldErrors = {};
      if (!streetAddress) nextErrors.streetAddress = `${t('errors:validation.required')}: ${t('forms:step2.street')}`;
      if (!postalCode) nextErrors.postalCode = `${t('errors:validation.required')}: ${t('forms:step2.postalCode')}`;
      if (!city) nextErrors.city = `${t('errors:validation.required')}: ${t('forms:step2.city')}`;
      setFieldErrors(nextErrors);
      setBanner({
        type: 'warning',
        title: t('errors:validation.addressIncomplete'),
        description: t('errors:validation.fillAllAddressFields')
      });
      return false;
    }
    
    setBanner(null);
    setFieldErrors({});
    return true;
  };

  // E-ID Verification starten (von Step 1 zu Step 2)
  const handleStartEIdVerification = async () => {
    if (!handleValidateAddress()) {
      return;
    }

    setBanner(null);
    setFieldErrors({});
    setStep(2);
  };

  // E-ID Verification QR-Code erstellen (in Step 2)
  const handleCreateEIdVerification = async () => {
    setIsCreatingVerification(true);
    try {
      const verification = await verificationBusinessAPI.createVerification();
      setVerificationUrl(verification.verification_url);
      setBanner(null);
      
      // Start polling für Verification Resultat
      startPollingVerification(verification.id);
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    } finally {
      setIsCreatingVerification(false);
    }
  };

  // Step 3: Volksbegehren auswählen (nach E-ID)

  const startPollingVerification = (verificationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await verificationBusinessAPI.getVerification(verificationId);
        if (result.state === 'SUCCESS' && result.wallet_response) {
          clearInterval(pollInterval);

          // Extrahiere Daten aus Wallet Response
          console.log('Verification result:', result);
          const credentialData = result.wallet_response?.credential_subject_data;
          if (credentialData) {
            const verifiedData = {
              given_name: credentialData.given_name || "",
              family_name: credentialData.family_name || "",
              birth_date: credentialData.birth_date || ""
            };
            setVerifiedEIdData(verifiedData);

            // Validiere Einwohner-Daten gegen Backend
            await validateEinwohnerData(verifiedData);
          }

          // Nur zu Step 4 gehen wenn kein Fehler aufgetreten ist
          if (!flowAborted) {
            setStep(4);
          }
          
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
          setFlowAborted(true);
          setBanner({
            type: 'error',
            title: t('common:error'),
            description: t('errors:api.verificationFailed')
          });
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);

    // Stop polling nach 5 Minuten
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  // Validiere Einwohner-Daten direkt nach E-ID Verifikation
  const validateEinwohnerData = async (verifiedData: { given_name: string; family_name: string; birth_date: string }) => {
    if (!municipalityDetails) {
      setBanner({
        type: 'error',
        title: t('common:error'),
        description: 'Gemeindedaten nicht verfügbar.'
      });
      return;
    }

    try {
      // Normalisiere BFS-Nummer (entferne führende Nullen)
      const normalizedBfs = municipalityDetails.bfs.replace(/^0+/, '');
      
      // 1. Prüfe ob Gemeinde mit BFS-Nummer existiert
      console.log('Searching for gemeinde with BFS:', normalizedBfs, '(original:', municipalityDetails.bfs, ')');
      const { data: gemeindeData, error: gemeindeError } = await supabase
        .from("gemeinden")
        .select("*")
        .eq("bfs_nummer", normalizedBfs)
        .maybeSingle();

      console.log('Gemeinde query result:', { gemeindeData, gemeindeError });

      if (gemeindeError) {
        setBanner({
          type: 'error',
          title: 'Fehler beim Laden der Gemeinde',
          description: `Datenbankfehler: ${gemeindeError.message}`
        });
        return;
      }

      if (!gemeindeData) {
        setBanner({
          type: 'error',
          title: 'Gemeinde nicht registriert',
          description: `Gemeinde mit BFS-Nummer ${municipalityDetails.bfs} ist nicht im System registriert.`
        });
        return;
      }

      // 2. Prüfe ob Einwohner mit diesen Daten existiert
      console.log('Searching for einwohner with:', {
        gemeinde_id: gemeindeData.id,
        vorname: verifiedData.given_name,
        nachname: verifiedData.family_name,
        geburtsdatum: verifiedData.birth_date
      });

      const { data: einwohnerData, error: einwohnerError } = await supabase
        .from("einwohner")
        .select("*")
        .eq("gemeinde_id", gemeindeData.id)
        .ilike("vorname", verifiedData.given_name)
        .ilike("nachname", verifiedData.family_name)
        .eq("geburtsdatum", verifiedData.birth_date)
        .maybeSingle();

      console.log('Einwohner query result:', { einwohnerData, einwohnerError });

      if (einwohnerError) {
        setBanner({
          type: 'error',
          title: 'Fehler beim Laden der Einwohnerdaten',
          description: `Datenbankfehler: ${einwohnerError.message}`
        });
        return;
      }

      if (!einwohnerData) {
        setFlowAborted(true);
        setBanner({
          type: 'error',
          title: 'Einwohner nicht gefunden',
          description: `Ihre Daten (${verifiedData.given_name} ${verifiedData.family_name}, Geburtsdatum: ${verifiedData.birth_date}) stimmen nicht 1:1 mit den registrierten Einwohnerdaten in ${gemeindeData.name} überein.`
        });
        return;
      }

      // Erfolg: Einwohner gefunden
      setFlowAborted(false);
      setBanner({
        type: 'success',
        title: 'Einwohner in Gemeinde gefunden',
        description: `Ihre Daten wurden erfolgreich verifiziert. Sie sind als Einwohner in ${gemeindeData.name} (${gemeindeData.kanton}) registriert.`
      });

    } catch (e: any) {
      console.error('Validation error:', e);
      setFlowAborted(true);
      setBanner({
        type: 'error',
        title: t('common:error'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    }
  };

  // Vereinfachte Backend-Validierung vor Credential-Ausstellung
  const validateBackendDataForCredential = async (): Promise<boolean> => {
    if (!municipalityDetails || !verifiedEIdData) {
      return false;
    }

    try {
      // Prüfe ob bereits ein Credential für dieses Volksbegehren ausgestellt wurde
      const { data: gemeindeData } = await supabase
        .from("gemeinden")
        .select("id")
        .eq("bfs_nummer", municipalityDetails.bfs)
        .maybeSingle();

      if (!gemeindeData) return false;

      const { data: einwohnerData } = await supabase
        .from("einwohner")
        .select("id")
        .eq("gemeinde_id", gemeindeData.id)
        .eq("vorname", verifiedEIdData.given_name)
        .eq("nachname", verifiedEIdData.family_name)
        .eq("geburtsdatum", verifiedEIdData.birth_date)
        .maybeSingle();

      if (!einwohnerData) return false;

      const selectedVolksbegehren = normalizedVolksbegehren.find(v => v.id === selectedVolksbegehrenId);
      if (selectedVolksbegehren) {
        const { data: existingCredential } = await supabase
          .from("credentials")
          .select("*")
          .eq("einwohner_id", einwohnerData.id)
          .eq("volksbegehren_id", selectedVolksbegehren.id)
          .eq("status", "issued")
          .maybeSingle();

        if (existingCredential) {
          setBanner({
            type: 'warning',
            title: 'Credential bereits vorhanden',
            description: `Für dieses Volksbegehren wurde bereits ein Credential ausgestellt.`
          });
          return false;
        }
      }

      return true;
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error'),
        description: e?.message ?? t('errors:api.unknownError')
      });
      return false;
    }
  };

  // Stimmregister-Credential ausstellen
  const handleIssueStimmregisterCredential = async () => {
    let credentialDbId: string | null = null;

    try {
      // Validiere nur, dass kein Duplikat-Credential existiert
      const isValid = await validateBackendDataForCredential();
      if (!isValid) {
        return;
      }

      const selectedVolksbegehren = normalizedVolksbegehren.find(v => v.id === selectedVolksbegehrenId);

      if (!selectedVolksbegehren || !verifiedEIdData) {
        throw new Error('Missing required data for credential issuance');
      }

      // Hole die UUID und end_date des Volksbegehren aus der Datenbank
      const { data: volksbegehrenDbData, error: volksbegehrenError } = await supabase
        .from("volksbegehren")
        .select("id, end_date")
        .eq("slug", selectedVolksbegehren.slug)
        .maybeSingle();

      if (volksbegehrenError || !volksbegehrenDbData) {
        throw new Error(`Volksbegehren mit Slug ${selectedVolksbegehren.slug} nicht in Datenbank gefunden`);
      }

      const volksbegehrenUuid = volksbegehrenDbData.id;
      const volksbegehrenEndDate = volksbegehrenDbData.end_date;

      // Prüfe ob das Volksbegehren noch gültig ist
      if (volksbegehrenEndDate) {
        const endDate = new Date(volksbegehrenEndDate);
        endDate.setHours(23, 59, 59, 999); // Setze auf Ende des Tages
        const now = new Date();
        if (endDate < now) {
          setBanner({
            type: 'error',
            title: 'Volksbegehren nicht mehr gültig',
            description: `Dieses Volksbegehren ist abgelaufen (gültig bis ${new Date(volksbegehrenEndDate).toLocaleDateString('de-CH')}). Es können keine weiteren Stimmregister-Nachweise ausgestellt werden.`
          });
          return;
        }
      }

      // Hole Gemeinde- und Einwohner-Daten für DB-Speicherung
      let einwohnerDbId: string | null = null;
      let gemeindeDbId: string | null = null;

      if (!municipalityDetails || !verifiedEIdData) {
        throw new Error('Municipality or verified E-ID data missing');
      }

      console.log('Looking up gemeinde and einwohner for credential storage:', {
        bfs: municipalityDetails.bfs,
        vorname: verifiedEIdData.given_name,
        nachname: verifiedEIdData.family_name,
        geburtsdatum: verifiedEIdData.birth_date
      });

      const { data: gemeindeData, error: gemeindeError } = await supabase
        .from("gemeinden")
        .select("id, name, kanton, did")
        .eq("bfs_nummer", municipalityDetails.bfs)
        .maybeSingle();

      if (gemeindeError) {
        console.error('Error fetching gemeinde:', gemeindeError);
        throw new Error(`Gemeinde lookup failed: ${gemeindeError.message}`);
      }

      if (!gemeindeData) {
        throw new Error(`Gemeinde mit BFS ${municipalityDetails.bfs} nicht gefunden`);
      }

      gemeindeDbId = gemeindeData.id;
      const gemeindeDid = gemeindeData.did;
      console.log('Found gemeinde:', gemeindeData);

      const { data: einwohnerData, error: einwohnerError } = await supabase
        .from("einwohner")
        .select("id, vorname, nachname, geburtsdatum")
        .eq("gemeinde_id", gemeindeData.id)
        .eq("vorname", verifiedEIdData.given_name)
        .eq("nachname", verifiedEIdData.family_name)
        .eq("geburtsdatum", verifiedEIdData.birth_date)
        .maybeSingle();

      if (einwohnerError) {
        console.error('Error fetching einwohner:', einwohnerError);
        throw new Error(`Einwohner lookup failed: ${einwohnerError.message}`);
      }

      if (!einwohnerData) {
        throw new Error(`Einwohner ${verifiedEIdData.given_name} ${verifiedEIdData.family_name} (${verifiedEIdData.birth_date}) nicht in ${gemeindeData.name} gefunden`);
      }

      einwohnerDbId = einwohnerData.id;
      console.log('Found einwohner:', einwohnerData);

      // Lösche alte Credentials mit Status != "issued" (falls vorhanden)
      await supabase
        .from("credentials")
        .delete()
        .eq("einwohner_id", einwohnerDbId)
        .eq("volksbegehren_id", volksbegehrenUuid)
        .neq("status", "issued");

      // Nullifier generieren: Hash(EinwohnerID + VolksbegehrensID + Secret)
      // Secret = GemeindeID (hardcoded)
      const nullifierInput = `${einwohnerDbId}${volksbegehrenUuid}${gemeindeDbId}`;
      const nullifier = await hashString(nullifierInput);
      console.log('Generated nullifier from:', { einwohnerDbId, volksbegehrenUuid, gemeindeDbId });

      // Bestimme Gültigkeitsdatum aus Volksbegehren end_date
      // WICHTIG: Backend erwartet Z-Format mit 3 Dezimalstellen (.000Z)
      let validUntil: string;
      if (volksbegehrenEndDate) {
        // Konvertiere end_date zu ISO-String und setze Zeit auf Mitternacht
        const validUntilDate = new Date(volksbegehrenEndDate);
        validUntilDate.setHours(0, 0, 0, 0);
        validUntil = validUntilDate.toISOString(); // Erzeugt Format mit .000Z
      } else {
        // Fallback: 1 Jahr ab jetzt
        const validUntilDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        validUntilDate.setHours(0, 0, 0, 0);
        validUntil = validUntilDate.toISOString(); // Erzeugt Format mit .000Z
        console.warn('No end_date found for Volksbegehren, using fallback validity period');
      }

      // Speichere Credential-Anfrage in DB (Status: pending) mit allen relevanten Daten
      const { data: credentialData, error: credentialError } = await supabase
        .from("credentials")
        .insert({
          einwohner_id: einwohnerDbId,
          volksbegehren_id: volksbegehrenUuid,
          status: "pending",
          nullifier: nullifier,
          issuer_did: gemeindeDid,
          issued_date: new Date().toISOString().slice(0, 10),
          credential_valid_from: new Date().toISOString(),
          credential_valid_until: validUntil
        })
        .select()
        .single();

      if (credentialError) {
        console.error('Failed to create credential record:', credentialError);
        throw new Error(`Credential DB insert failed: ${credentialError.message}`);
      }

      credentialDbId = credentialData?.id || null;
      console.log('Created credential record with ID:', credentialDbId);

      // Payload für Backend API - Backend benötigt die Claims im credential_subject_data
      // WICHTIG: Stelle sicher, dass Zeitformate im Z-Format sind (nicht +00:00)
      const payload = {
        metadata_credential_supported_id: ["stimmregister-vc"],
        credential_subject_data: {
          nullifier: credentialData.nullifier,
          volksbegehren: volksbegehrenUuid,
          issuerDid: credentialData.issuer_did,
          issuedDate: credentialData.issued_date
        },
        offer_validity_seconds: 86400,
        credential_valid_from: new Date(credentialData.credential_valid_from).toISOString(),
        credential_valid_until: new Date(credentialData.credential_valid_until).toISOString(),
        status_lists: statusListUrl ? [statusListUrl] : undefined
      };

      const response = await gemeindeIssuerAPI.issueStimmregisterCredential(payload);
      
      setIssuedCredentialId(response.management_id || null);
      setOfferDeeplink(response.offer_deeplink || null);

      // Update Credential in DB mit API-Response
      if (credentialDbId) {
        console.log('Updating credential with API response:', {
          credential_id: response.id,
          management_id: response.management_id,
          offer_deeplink: response.offer_deeplink
        });

        const { error: updateError } = await supabase
          .from("credentials")
          .update({
            credential_id: response.id,
            management_id: response.management_id,
            offer_deeplink: response.offer_deeplink,
            status: "issued"
          })
          .eq("id", credentialDbId);

        if (updateError) {
          console.error('Failed to update credential:', updateError);
          throw new Error(`Credential update failed: ${updateError.message}`);
        }

        console.log('Successfully updated credential in database');
      }
      
      setBanner({
        type: 'success',
        title: 'Stimmrechtsausweis-Nachweis erfolgreich erstellt',
        description: 'Der Stimmrechtsausweis-Nachweis kann mit der swiyu-Wallet App heruntergeladen werden.'
      });

      // Gehe zu Step 5 (Erfolg)
      setStep(5);

    } catch (e: any) {
      console.error('Credential issuance failed:', e);

      // Update Credential in DB auf "error" Status
      if (credentialDbId) {
        await supabase
          .from("credentials")
          .update({
            status: "error"
          })
          .eq("id", credentialDbId);
      }

      setBanner({
        type: 'error',
        title: t('errors:api.credentialError'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    }
  };


  // Postal code handler wie im normalen Flow
  const handlePostalCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    setPostalCode(digitsOnly);
  };

  return (
    <section aria-labelledby="gemeinde-issuer-section">
      <div className="space-y-4 sm:space-y-6 w-full max-w-[960px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="w-full">
          <h1
            id="gemeinde-issuer-section"
            ref={stepTitleRef}
            tabIndex={-1}
            className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] md:text-[32px] md:leading-[43px] font-semibold text-[#1f2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2937]/40"
          >
{t('forms:step', { current: step, total: 5 })}
          </h1>
        </div>

        {/* Alert Banner */}
        {banner && (
          <div
            ref={bannerRef}
            role={(banner.type === 'error' || banner.type === 'warning') ? 'alert' : 'status'}
            aria-live={(banner.type === 'error' || banner.type === 'warning') ? 'assertive' : 'polite'}
            tabIndex={-1}
            className={
              banner.type === 'error'
                ? 'bg-[#ffedee] p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]'
                : banner.type === 'warning'
                ? 'bg-[#fff7ed] p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]'
                : banner.type === 'success'
                ? 'bg-green-50 p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]'
                : 'bg-blue-50 p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]'
            }>
            <div className="flex items-start gap-3">
              {banner.type === 'error' && <AlertCircle className="w-8 h-8 text-[#d8232a]" />}
              {banner.type === 'warning' && <Info className="w-8 h-8 text-[#9a3412]" />}
              {banner.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              {banner.type === 'info' && <Info className="w-6 h-6 text-blue-600" />}
              <div>
                <div className={
                  banner.type === 'error'
                    ? 'text-[#d8232a] text-[20px] leading-[32px] font-medium'
                    : banner.type === 'warning'
                    ? 'text-[#9a3412] text-[20px] leading-[32px] font-medium'
                    : 'text-[#1f2937] text-[20px] leading-[32px] font-medium'
                }>
                  {banner.title}
                </div>
                {banner.description && (
                  <div className={
                    banner.type === 'error'
                      ? 'text-[#d8232a] text-[20px] leading-[32px] font-medium'
                      : banner.type === 'warning'
                      ? 'text-[#9a3412] text-[20px] leading-[32px] font-medium'
                      : 'text-[#1f2937] text-[16px] leading-[24px]'
                  }>
                    {banner.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid gap-6 md:gap-8"> 
            <div className="space-y-4 w-full">

              {/* Step 1: Adresse eingeben */}
              {step === 1 && (
                <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">
                      {t('forms:step2.title')}
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street-address" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                          {t('forms:step2.street')}
                        </Label>
                        <NativeAddressSearch 
                          id="street-address"
                          value={streetAddress}
                          onValueChange={(v) => { 
                            setStreetAddress(v); 
                            setFieldErrors(prev => ({ ...prev, streetAddress: undefined })); 
                          }}
                          onAddressSelect={handleAddressSelect}
                          placeholder={t('forms:step2.streetPlaceholder')}
                          className="h-12 text-[16px] sm:text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]"
                        />
                        {fieldErrors.streetAddress && (
                          <ErrorBadge role="alert" aria-live="polite">{fieldErrors.streetAddress}</ErrorBadge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                        <div className="space-y-2 relative sm:col-span-2">
                          <Label htmlFor="postal-code" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                            {t('forms:step2.postalCode')}
                          </Label>
                          <Input 
                            id="postal-code" 
                            value={postalCode} 
                            inputMode="numeric" 
                            pattern="[0-9]*" 
                            onChange={e => { 
                              handlePostalCodeChange(e.target.value); 
                              setFieldErrors(prev => ({ ...prev, postalCode: undefined })); 
                            }} 
                            placeholder={t('forms:step2.postalCodePlaceholder')} 
                            className="h-12 text-[16px] sm:text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]"
                          />
                          {fieldErrors.postalCode && (
                            <ErrorBadge role="alert" aria-live="polite">{fieldErrors.postalCode}</ErrorBadge>
                          )}
                        </div>
                        <div className="space-y-2 sm:col-span-4">
                          <Label htmlFor="city" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                            {t('forms:step2.city')}
                          </Label>
                          <Input 
                            id="city" 
                            value={city} 
                            onChange={e => { 
                              setCity(e.target.value); 
                              setFieldErrors(prev => ({ ...prev, city: undefined })); 
                            }} 
                            placeholder={t('forms:step2.cityPlaceholder')} 
                            className="h-12 text-[16px] sm:text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]"
                          />
                          {fieldErrors.city && (
                            <ErrorBadge role="alert" aria-live="polite">{fieldErrors.city}</ErrorBadge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={handleStartEIdVerification}
                      disabled={isCreatingVerification || !streetAddress || !postalCode || !city}
                      className="w-full sm:w-auto"
                    >
{t('common:next')}
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Adress-Übersicht + E-ID Verifikation mit swiyu-Wallet */}
              {step === 2 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      {/* Adressdaten Section */}
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                          {t('forms:step3.sectionAddressData', 'Adressdaten')}
                        </div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:step2.street', 'Strasse / Nr.')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {streetAddress || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:step2.postalCode', 'PLZ')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {postalCode || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:step2.city', 'Ort')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {city || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:step3.municipality', 'Politische Gemeinde')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {municipalityDetails?.town || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:step3.canton', 'Kanton')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {municipalityDetails?.cantonFromBfs || municipalityDetails?.canton || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            BFS-Nr.:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {municipalityDetails?.bfs || '—'}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <Button
                      variant="bare"
                      size="xl"
                      onClick={() => { setBanner(null); setStep(1); }}
                      className="w-full sm:w-auto"
                    >
                      {t('common:back')}
                    </Button>
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={() => setStep(3)}
                      className="w-full sm:w-auto"
                    >
                      Verifikation mit swiyu-Wallet
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: E-ID Verifikation mit swiyu-Wallet */}
              {step === 3 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                          {t('forms:step4.verification.title', 'Verifikation mit swiyu-Wallet')}
                        </div>
                      </div>
                      
                      {verificationUrl && !verifiedEIdData && (
                        <>
                          <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                            Scannen Sie den QR-Code mit Ihrer swiyu-Wallet App, um sich auszuweisen. Nach dem erfolgreichen Identifizieren wird Ihre Willensbekundung erstellt.
                          </div>
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                              <QRCode value={verificationUrl} size={256} />
                              <p className="text-[14px] text-[#6b7280] mt-4">
                                QR-Code mit swiyu-Wallet App scannen
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {verifiedEIdData && (
                        <div className="p-6 bg-green-50 rounded-[3px] border border-green-200 mb-6">
                          <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                            <h4 className="text-[20px] font-semibold text-green-800">
                              E-ID erfolgreich verifiziert
                            </h4>
                          </div>
                          <div className="space-y-2 text-green-700">
                            <div><strong>Vorname:</strong> {verifiedEIdData.given_name}</div>
                            <div><strong>Name:</strong> {verifiedEIdData.family_name}</div>
                            <div><strong>Geburtsdatum:</strong> {verifiedEIdData.birth_date}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    {flowAborted ? (
                      <Button
                        variant="filled"
                        size="xl"
                        onClick={handleResetFlow}
                        className="w-full sm:w-auto"
                      >
                        Nochmals neu beginnen
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="bare"
                          size="xl"
                          onClick={() => { setBanner(null); setStep(2); }}
                          className="w-full sm:w-auto"
                        >
                          {t('common:back')}
                        </Button>
                        
                        {verificationUrl && !verifiedEIdData && (
                          <button
                            onClick={() => verificationUrl && (window.location.href = `swiyu-verify://?client_id=did:tdw:Qmf9i6m1EFSXmW2jB5JZGW1mPrEsGoRHXN8v8YnqHNEySF:identifier-reg.trust-infra.swiyu-int.admin.ch:api:v1:did:93f3fb23-f7d3-4754-b35c-3686f69ecb64&request_uri=${encodeURIComponent(verificationUrl)}`)}
                            disabled={!verificationUrl}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('forms:step4.verification.openWallet')}
                            <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                          </button>
                        )}

                        {verifiedEIdData && (
                          <Button
                            variant="filled"
                            size="xl"
                            onClick={() => setStep(4)}
                            className="w-full sm:w-auto"
                          >
                            {t('common:next')}
                            <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Volksbegehren auswählen */}
              {step === 4 && !flowAborted && (
                <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">
                      {t('forms:step1.title')}
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type-select" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                          {t('forms:step1.selectType')}
                        </Label>
                        <NativeSelect
                          id="type-select"
                          options={[
                            { value: "Initiative", label: t('forms:step1.types.initiative') },
                            { value: "Referendum", label: t('forms:step1.types.referendum') }
                          ]}
                          value={type}
                          onValueChange={(v) => {
                            setType(v as any);
                            // Clear previously selected title if type changes to prevent stale selection
                            setSelectedVolksbegehrenId("");
                            setFieldErrors(prev => ({ ...prev, type: undefined, selectedVolksbegehrenId: undefined }));
                          }}
                          placeholder={t('forms:step1.selectType')}
                          aria-label={t('forms:step1.selectType')}
                          className="w-full"
                        />
                        {fieldErrors.type && (
                          <ErrorBadge role="alert" aria-live="polite">{fieldErrors.type}</ErrorBadge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title-select" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                          {t('forms:step1.selectTitle')}
                        </Label>
                        <NativeSelect
                          id="title-select"
                          options={filteredVolksbegehrenOptions.map(o => {
                            const titleVariants = createTitleVariants(o.title, 45);
                            return { 
                              value: o.id, 
                              label: o.title, // Full title for dropdown options
                              displayLabel: titleVariants.short // Short title for input field display
                            };
                          })}
                          value={selectedVolksbegehrenId}
                          onValueChange={(v) => { 
                            setSelectedVolksbegehrenId(v); 
                            setFieldErrors(prev => ({ ...prev, selectedVolksbegehrenId: undefined })); 
                          }}
                          disabled={!type}
                          placeholder={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                          aria-label={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                          className="w-full"
                        />
                        {fieldErrors.selectedVolksbegehrenId && (
                          <ErrorBadge role="alert" aria-live="polite">{fieldErrors.selectedVolksbegehrenId}</ErrorBadge>
                        )}

                        {type && filteredVolksbegehrenOptions.length === 0 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[3px]">
                            <p className="text-[14px] text-amber-800">
                              {t('forms:gemeinde.step2.noVolksbegehren', 'Für Ihre Gemeinde sind aktuell keine Volksbegehren verfügbar.')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <Button
                      variant="bare"
                      size="xl"
                      onClick={() => { setBanner(null); setStep(3); }}
                      className="w-full sm:w-auto"
                    >
                      {t('common:back')}
                    </Button>
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={() => {
                        const missingType = !type;
                        const missingTitle = !selectedVolksbegehrenId;
                        if (missingType || missingTitle) {
                          const nextErrors: typeof fieldErrors = {};
                          if (missingType) nextErrors.type = t('errors:validation.required');
                          if (missingTitle) nextErrors.selectedVolksbegehrenId = t('errors:validation.required');
                          setFieldErrors(prev => ({ ...prev, ...nextErrors }));
                          let description = '';
                          if (missingType && missingTitle) {
                            description = t('errors:validation.selectTypeAndTitle');
                          } else if (missingType) {
                            description = t('forms:step1.selectType');
                          } else if (missingTitle) {
                            description = t('forms:step1.selectTitle');
                          }
                          setBanner({
                            type: 'warning',
                            title: t('errors:validation.missingFields'),
                            description
                          });
                          return;
                        }
                        setBanner(null);
                        setFieldErrors({});
                        handleIssueStimmregisterCredential();
                      }}
                      disabled={filteredVolksbegehrenOptions.length === 0 && type !== ""}
                      className="w-full sm:w-auto"
                    >
                      Stimmrechtsausweis-Nachweis erstellen
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Flow abgebrochen - Einwohner nicht gefunden */}
              {step === 4 && flowAborted && (
                <div className="space-y-6 w-full">
                  <div className="text-center py-8">
                    <p className="text-[18px] text-[#6b7280] mb-6">
                      Der Vorgang wurde abgebrochen. Bitte beginnen Sie von vorne.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={handleResetFlow}
                      className="w-full sm:w-auto"
                    >
                      Nochmals neu beginnen
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Stimmregister-VC Download */}
              {step === 5 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6 max-w-full">
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                          Stimmrechtsausweis-Nachweis erfolgreich erstellt
                        </div>
                      </div>
                      
                      <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                        Der Stimmrechtsausweis-Nachweis kann mit der swiyu-Wallet App heruntergeladen werden. Scannen Sie dazu den QR-Code mit Ihrer swiyu-Wallet App oder klicken Sie auf den Button.
                      </div>
                      
                      {/* Initiative Info */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-[3px] border border-blue-200 w-full">
                        <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-blue-900 font-medium">
                          Initiative: "{selectedItem?.title || 'Unbekannte Initiative'}"
                        </div>
                        {selectedItem?.level && (
                          <div className="mt-1 text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px] text-blue-700">
                            Ebene: {selectedItem.level}
                          </div>
                        )}
                      </div>
                      
                      {offerDeeplink && (
                        <div className="flex flex-col items-center py-6 w-full">
                          <QRCode value={offerDeeplink} size={192} />
                          {credentialStatus && (
                            <div className="mt-4 flex items-center gap-2">
                              <span className="text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px] text-[#1f2937] font-medium">
                                Status:
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusDisplay(credentialStatus).bgColor} ${getStatusDisplay(credentialStatus).color}`}>
                                {getStatusDisplay(credentialStatus).text}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end w-full">
                        <button
                          onClick={() => offerDeeplink && (window.location.href = offerDeeplink)}
                          disabled={!offerDeeplink}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Stimmrechtsausweis-Nachweis herunterladen
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AlertDialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <AlertDialogContent className="max-w-[480px] rounded-[2px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[22px] leading-[33px] text-[#1f2937]">
              {t('forms:shareSuccess.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[18px] leading-[28px] text-[#1f2937]">
              {t('forms:shareSuccess.message')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShareModalOpen(false)} 
              className="bg-[#5c6977] hover:bg-[#4c5967] text-white text-[18px] leading-[28px]"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}