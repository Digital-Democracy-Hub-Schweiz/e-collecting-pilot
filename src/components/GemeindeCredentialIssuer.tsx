import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ErrorBadge } from "@/components/ui/error-badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { verificationBusinessAPI } from "@/services/verificationAPI";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { RefreshCw, Share2, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { determineCantonFromBfs } from "@/utils/cantonUtils";
import { useTranslation } from 'react-i18next';
import { useCurrentLanguage, getLocalizedPath } from "@/utils/routing";
import { NativeAddressSearch } from "@/components/ui/native-address-search";
import { AddressHit } from "@/services/addressAPI";
import { createTitleVariants } from "@/lib/title-utils";

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
    const response = await fetch('https://issuer-gemeinde.ecollecting.ch/management/api/credentials', {
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
  }
};


type Option = {
  id: string;
  title: string;
};

export function GemeindeCredentialIssuer() {
  const { t } = useTranslation(['forms', 'errors', 'common']);
  const currentLang = useCurrentLanguage();
  const volksbegehren = useVolksbegehren();
  
  // Form state
  const [selectedVolksbegehrenId, setSelectedVolksbegehrenId] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [step, setStep] = useState<1 | 3 | 4 | 5>(1);

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

  // UI state
  const [municipalityDetails, setMunicipalityDetails] = useState<{
    town: string;
    canton: string;
    bfs: string;
    cantonFromBfs?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
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
    return (volksbegehren as any[]).map((item, idx) => {
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
        level: item?.level ?? null
      };
    });
  }, [volksbegehren]);

  const volksbegehrenOptions: Option[] = useMemo(() => {
    return normalizedVolksbegehren.map(({ id, title }) => ({
      id,
      title
    }));
  }, [normalizedVolksbegehren]);

  // Gefilterte Volksbegehren basierend auf Gemeinde/Kanton
  const filteredVolksbegehrenOptions: Option[] = useMemo(() => {
    if (!municipalityDetails) {
      return volksbegehrenOptions; // Wenn keine Gemeinde bekannt, zeige alle
    }

    const userCanton = municipalityDetails.cantonFromBfs || municipalityDetails.canton;
    
    return volksbegehrenOptions.filter(option => {
      const volksbegehren = normalizedVolksbegehren.find(v => v.id === option.id);
      if (!volksbegehren?.level) return true; // Wenn kein Level definiert, zeige an
      
      // "Bund" Level -> für alle Kantone verfügbar
      if (volksbegehren.level === "Bund") return true;
      
      // Kanton-spezifisch -> prüfe ob Kanton übereinstimmt
      if (volksbegehren.level.includes("Kanton")) {
        const cantonInLevel = volksbegehren.level.replace("Kanton ", "");
        return userCanton.includes(cantonInLevel) || cantonInLevel.includes(userCanton);
      }
      
      // Gemeinde-spezifisch -> prüfe ob Gemeinde übereinstimmt
      if (volksbegehren.level.includes(municipalityDetails.town)) {
        return true;
      }
      
      // Default: zeige wenn unklar
      return true;
    });
  }, [volksbegehrenOptions, normalizedVolksbegehren, municipalityDetails]);

  // Selected item for summary display
  const selectedItem = useMemo(() => {
    return normalizedVolksbegehren.find(o => o.id === selectedVolksbegehrenId) || null;
  }, [normalizedVolksbegehren, selectedVolksbegehrenId]);

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

  // E-ID Verification starten (direkt von Step 1)
  const handleStartEIdVerification = async () => {
    if (!handleValidateAddress()) {
      return;
    }

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
  const handleNextFromStep3 = () => {
    const missingVolksbegehren = !selectedVolksbegehrenId;
    
    if (missingVolksbegehren) {
      setFieldErrors({ selectedVolksbegehrenId: t('errors:validation.required') });
      setBanner({
        type: 'warning',
        title: t('errors:validation.missingFields'),
        description: t('forms:gemeinde.step1.selectVolksbegehren')
      });
      return;
    }
    
    // Bei Volksbegehren-Auswahl direkt Stimmregister VC ausstellen
    handleIssueStimmregisterCredential();
  };

  const startPollingVerification = (verificationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await verificationBusinessAPI.getVerification(verificationId);
        if (result.state === 'SUCCESS' && result.wallet_response) {
          clearInterval(pollInterval);

          // Extrahiere Daten aus Wallet Response
          const credentialData = result.wallet_response?.credential_subject_data;
          if (credentialData) {
            setVerifiedEIdData({
              given_name: credentialData.given_name || "",
              family_name: credentialData.family_name || "",
              birth_date: credentialData.birth_date || ""
            });
          }

          setBanner({
            type: 'success',
            title: t('forms:gemeinde.step2.verification.success'),
            description: t('forms:gemeinde.step2.verification.successDescription')
          });

          // Nach E-ID Verifikation zu Volksbegehren-Auswahl
          setStep(3);
          
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
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

  // Stimmregister-Credential ausstellen
  const handleIssueStimmregisterCredential = async () => {
    try {
      const selectedVolksbegehren = normalizedVolksbegehren.find(v => v.id === selectedVolksbegehrenId);
      
      if (!selectedVolksbegehren || !verifiedEIdData) {
        throw new Error('Missing required data for credential issuance');
      }

      // Hash der Volksbegehren-ID generieren
      const volksbegehrenhash = await hashString(selectedVolksbegehren.id);

      // Payload mit nur den erforderlichen Claims
      const payload = {
        metadata_credential_supported_id: ["stimmregister-vc"],
        credential_subject_data: {
          volksbegehren: volksbegehrenhash,
          issuedDate: new Date().toISOString().slice(0, 10)
        },
        offer_validity_seconds: 86400,
        credential_valid_from: new Date().toISOString(),
        credential_valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await gemeindeIssuerAPI.issueStimmregisterCredential(payload);
      
      setIssuedCredentialId(response.management_id || null);
      setOfferDeeplink(response.offer_deeplink || null);
      
      setBanner({
        type: 'success',
        title: t('forms:gemeinde.success.title'),
        description: t('forms:gemeinde.success.description')
      });

      // Gehe zu Step 5 (Erfolg)
      setStep(5);

    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('errors:api.credentialError'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    }
  };

  const handleShare = async () => {
    try {
      const selectedVolksbegehren = normalizedVolksbegehren.find(v => v.id === selectedVolksbegehrenId);
      const title = selectedVolksbegehren?.title || "Volksbegehren";
      const path = getLocalizedPath(currentLang, 'volksbegehren', { id: selectedVolksbegehren?.slug || selectedVolksbegehrenId });
      const url = `${window.location.origin}${path}`;
      
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `${t('forms:shareText')}: ${title}`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      
      setShareModalOpen(true);
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error'),
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
            {t('forms:gemeinde.step', { current: step === 1 ? 1 : step === 3 ? 2 : step === 4 ? 3 : step === 5 ? 4 : step, total: 4 })} - {
              step === 1 ? t('forms:gemeinde.stepTitles.address', 'Adresse') :
              step === 3 ? t('forms:gemeinde.stepTitles.volksbegehren', 'Volksbegehren') :
              step === 4 ? t('forms:gemeinde.stepTitles.summary', 'Zusammenfassung') :
              step === 5 ? t('forms:gemeinde.stepTitles.success', 'Erfolgreich') :
              ''
            }
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
          <div className={cn("grid gap-6 md:gap-8", issuedCredentialId ? "md:grid-cols-2" : "")}> 
            <div className="space-y-4 w-full">

              {/* Step 1: Adresse eingeben (neue Reihenfolge) */}
              {step === 1 && (
                <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">
                      {t('forms:gemeinde.step1.addressTitle', 'Adresse eingeben')}
                    </h2>
                    <p className="text-[16px] leading-[24px] text-[#6b7280] mb-4">
                      {t('forms:gemeinde.step1.addressDescription', 'Geben Sie Ihre Adresse ein, um Ihre Gemeinde zu ermitteln und die verfügbaren Volksbegehren anzuzeigen.')}
                    </p>
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

                      {/* Gemeinde-Info anzeigen wenn verfügbar */}
                      {municipalityDetails && (
                        <div className="mt-4 p-4 bg-green-50 rounded-[3px] border border-green-200">
                          <h4 className="text-[16px] font-semibold text-green-800 mb-2">
                            {t('forms:gemeinde.step1.municipalityFound', 'Gemeinde ermittelt')}
                          </h4>
                          <div className="space-y-1 text-green-700 text-[14px]">
                            <div><strong>{t('forms:step3.municipality', 'Gemeinde')}:</strong> {municipalityDetails.town}</div>
                            <div><strong>{t('forms:step3.canton', 'Kanton')}:</strong> {municipalityDetails.cantonFromBfs || municipalityDetails.canton}</div>
                            <div><strong>BFS-Nr.:</strong> {municipalityDetails.bfs}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* E-ID Verification Button - standard form layout */}
                  {!verifiedEIdData && !verificationUrl && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                      <Button
                        variant="filled"
                        size="xl"
                        onClick={handleStartEIdVerification}
                        disabled={isCreatingVerification || !streetAddress || !postalCode || !city}
                        className="w-full sm:w-auto"
                      >
                        {isCreatingVerification && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
                        {t('forms:gemeinde.step2.startVerification', 'E-ID Verifikation starten')}
                        <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                      </Button>
                    </div>
                  )}

                  {/* QR Code für E-ID Verification - zeigen wenn URL vorhanden */}
                  {verificationUrl && !verifiedEIdData && (
                    <div className="mt-8 p-6 bg-white border border-blue-200 rounded-[3px]">
                      <h3 className="text-[18px] font-semibold text-[#1f2937] mb-2">
                        {t('forms:step4.verification.title')}
                      </h3>
                      <p className="text-[14px] text-[#6b7280] mb-4">
                        {t('forms:step4.verification.description')}
                      </p>
                      <div className="flex items-center justify-center py-4">
                        <QRCode value={verificationUrl} size={192} />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={() => verificationUrl && (window.location.href = `swiyu-verify://?client_id=did:tdw:Qmf9i6m1EFSXmW2jB5JZGW1mPrEsGoRHXN8v8YnqHNEySF:identifier-reg.trust-infra.swiyu-int.admin.ch:api:v1:did:93f3fb23-f7d3-4754-b35c-3686f69ecb64&request_uri=${encodeURIComponent(verificationUrl)}`)}
                          disabled={!verificationUrl}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('forms:step4.verification.openWallet')}
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Erfolgsmeldung nach E-ID Verifikation */}
                  {verifiedEIdData && (
                    <div className="mt-8 p-6 bg-green-50 rounded-[3px] border border-green-200">
                      <h3 className="text-[18px] font-semibold text-green-800 mb-2">
                        {t('forms:gemeinde.step2.verification.success')}
                      </h3>
                      <div className="space-y-1 text-green-700 text-[14px] mb-4">
                        <div><strong>{t('forms:gemeinde.firstName', 'Vorname')}:</strong> {verifiedEIdData.given_name}</div>
                        <div><strong>{t('forms:gemeinde.lastName', 'Name')}:</strong> {verifiedEIdData.family_name}</div>
                        <div><strong>{t('forms:gemeinde.birthDate', 'Geburtsdatum')}:</strong> {verifiedEIdData.birth_date}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="filled"
                          size="xl"
                          onClick={() => setStep(3)}
                          className="w-full sm:w-auto"
                        >
                          {t('forms:gemeinde.step1.nextToVolksbegehren', 'Zu Volksbegehren-Auswahl')}
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* Step 3: Volksbegehren auswählen (nach E-ID) */}
              {step === 3 && (
                <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">
                      {t('forms:gemeinde.step2.title', 'Volksbegehren auswählen')}
                    </h2>
                    
                    {/* Gemeinde-Info Reminder */}
                    {municipalityDetails && (
                      <div className="p-3 bg-blue-50 rounded-[3px] border border-blue-200 mb-4">
                        <div className="text-[14px] text-blue-800">
                          <strong>{t('forms:gemeinde.step2.yourMunicipality', 'Ihre Gemeinde')}:</strong> {municipalityDetails.town}, {municipalityDetails.cantonFromBfs || municipalityDetails.canton}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="volksbegehren-select" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">
                          {t('forms:gemeinde.step2.selectVolksbegehren', 'Verfügbare Volksbegehren für Ihre Gemeinde')}
                        </Label>
                        <NativeSelect
                          id="volksbegehren-select"
                          options={filteredVolksbegehrenOptions.map(o => {
                            const titleVariants = createTitleVariants(o.title, 45);
                            return { 
                              value: o.id, 
                              label: o.title,
                              displayLabel: titleVariants.short
                            };
                          })}
                          value={selectedVolksbegehrenId}
                          onValueChange={(v) => { 
                            setSelectedVolksbegehrenId(v); 
                            setFieldErrors(prev => ({ ...prev, selectedVolksbegehrenId: undefined })); 
                          }}
                          placeholder={t('forms:gemeinde.step2.selectVolksbegehrenlaceholder', 'Wählen Sie ein Volksbegehren')}
                          className="w-full"
                        />
                        {fieldErrors.selectedVolksbegehrenId && (
                          <ErrorBadge role="alert" aria-live="polite">{fieldErrors.selectedVolksbegehrenId}</ErrorBadge>
                        )}

                        {filteredVolksbegehrenOptions.length === 0 && (
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
                      onClick={() => { setBanner(null); setStep(1); }}
                      className="w-full sm:w-auto"
                    >
                      {t('common:back')}
                    </Button>
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={handleNextFromStep3}
                      disabled={filteredVolksbegehrenOptions.length === 0}
                      className="w-full sm:w-auto"
                    >
                      {t('forms:gemeinde.step3.issueCredential', 'Stimmregister-VC ausstellen')}
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Zusammenfassung */}
              {step === 4 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      {/* Volksbegehren Section */}
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                          {t('forms:step3.sectionVolksbegehren', 'Volksbegehren')}
                        </div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:title', 'Titel')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium break-words">
                            {selectedItem?.title || '—'}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">
                            {t('forms:level.label', 'Ebene')}:
                          </div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {selectedItem?.level || '—'}
                          </div>
                        </div>
                      </div>

                      {/* Gemeinde Section */}
                      <div className="py-4 mt-8">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                          {t('forms:gemeinde.step3.sectionGemeinde', 'Gemeinde')}
                        </div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
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

                  <div className="space-y-4 pt-4">
                    <div className="bg-[#fff7ed] p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Info className="w-8 h-8 text-[#9a3412]" />
                        </div>
                        <p className="text-[20px] leading-[32px] text-[#9a3412] font-medium">
                          {t('forms:gemeinde.step3.eidNotice', 'Im nächsten Schritt weisen Sie sich mit Ihrer swiyu E-ID aus. Name, Vorname und Geburtsdatum werden automatisch übernommen.')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                        onClick={handleStartEIdVerification}
                        disabled={isCreatingVerification}
                        className="w-full sm:w-auto"
                      >
                        {isCreatingVerification && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
                        {t('forms:gemeinde.step3.verifyButton', 'Mit E-ID ausweisen')}
                        <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Erfolg - Stimmregister-VC ausgestellt */}
              {step === 5 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      {!issuedCredentialId ? (
                        // E-ID Verification
                        <>
                          <div className="py-4">
                            <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                              {t('forms:gemeinde.step4.verification.title', 'E-ID Ausweis')}
                            </div>
                          </div>
                          <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                            {t('forms:gemeinde.step4.verification.description', 'Scannen Sie den QR-Code mit Ihrer swiyu E-ID App oder klicken Sie auf den Button.')}
                          </div>
                          {verificationUrl && (
                            <div className="flex items-center justify-center py-6">
                              <QRCode value={verificationUrl} size={192} />
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                            <button
                              onClick={() => { setBanner(null); setStep(3); }}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px]"
                            >
                              {t('common:back')}
                            </button>
                            <button
                              onClick={() => verificationUrl && (window.location.href = `swiyu-verify://?client_id=did:tdw:Qmf9i6m1EFSXmW2jB5JZGW1mPrEsGoRHXN8v8YnqHNEySF:identifier-reg.trust-infra.swiyu-int.admin.ch:api:v1:did:93f3fb23-f7d3-4754-b35c-3686f69ecb64&request_uri=${encodeURIComponent(verificationUrl)}`)}
                              disabled={!verificationUrl}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('forms:gemeinde.step4.verification.openWallet', 'E-ID App öffnen')}
                              <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                            </button>
                          </div>
                        </>
                      ) : (
                        // Erfolg - Stimmregister-VC ausgestellt
                        <>
                          <div className="py-4">
                            <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">
                              {t('forms:gemeinde.success.title', 'Stimmregister-Credential ausgestellt')}
                            </div>
                          </div>
                          <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                            {t('forms:gemeinde.success.description', 'Ihr Stimmregister-Credential wurde erfolgreich ausgestellt. Scannen Sie den QR-Code mit Ihrer swiyu E-ID App.')}
                          </div>

                          {/* Verifizierte E-ID Daten anzeigen */}
                          {verifiedEIdData && (
                            <div className="mb-6 p-4 bg-green-50 rounded-[3px] border border-green-200">
                              <h4 className="text-[18px] font-semibold text-green-800 mb-2">
                                {t('forms:gemeinde.success.verifiedData', 'Verifizierte Daten')}
                              </h4>
                              <div className="space-y-1 text-green-700">
                                <div><strong>{t('forms:gemeinde.firstName', 'Vorname')}:</strong> {verifiedEIdData.given_name}</div>
                                <div><strong>{t('forms:gemeinde.lastName', 'Name')}:</strong> {verifiedEIdData.family_name}</div>
                                <div><strong>{t('forms:gemeinde.birthDate', 'Geburtsdatum')}:</strong> {verifiedEIdData.birth_date}</div>
                              </div>
                            </div>
                          )}

                          {offerDeeplink && (
                            <div className="flex items-center justify-center py-6">
                              <QRCode value={offerDeeplink} size={192} />
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                            <button
                              onClick={handleShare}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px]"
                            >
                              <Share2 className="w-4 h-4 mr-2" /> {t('forms:shareVolksbegehren', 'Volksbegehren teilen')}
                            </button>
                            <button
                              onClick={() => offerDeeplink && (window.location.href = offerDeeplink)}
                              disabled={!offerDeeplink}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('forms:gemeinde.success.downloadCredential', 'Credential herunterladen')}
                              <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                            </button>
                          </div>
                        </>
                      )}
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