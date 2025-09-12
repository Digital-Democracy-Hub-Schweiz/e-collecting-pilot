import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomSelect } from "@/components/ui/custom-select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { verificationBusinessAPI } from "@/services/verificationAPI";
// import { useToast } from "@/hooks/use-toast";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { ShieldCheck, QrCode, RefreshCw, Share2, AlertTriangle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { determineCantonFromBfs } from "@/utils/cantonUtils";
import { useTranslation } from 'react-i18next';
import { useCurrentLanguage, getLocalizedPath } from "@/utils/routing";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { AddressHit } from "@/services/addressAPI";
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
  const { t } = useTranslation(['forms', 'errors', 'common']);
  // const { toast } = useToast();
  const currentLang = useCurrentLanguage();
  const volksbegehren = useVolksbegehren();
  const [type, setType] = useState<"Initiative" | "Referendum" | "">("");
  const [selectedId, setSelectedId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [signDate, setSignDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [streetAddress, setStreetAddress] = useState("");
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
    cantonFromBfs?: string;
  } | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);

  // Handler for address selection
  const handleAddressSelect = async (address: AddressHit) => {
    console.log('Address selected:', address);
    setStreetAddress(address.place.postalAddress.streetAddress);
    setPostalCode(address.place.postalAddress.postalCode);
    setCity(address.place.postalAddress.addressLocality);
    
    // Set municipality code for further processing
    const municipalityCode = address.place.additionalProperty.municipalityCode;
    console.log('Municipality code:', municipalityCode);
    setMunicipality(municipalityCode);

    // Set municipality details including canton determination
    const town = address.place.postalAddress.addressLocality;
    const canton = address.place.postalAddress.addressRegion || "";
    const bfs = municipalityCode;

    // Determine canton from BFS code if available
    let cantonFromBfs = "";
    if (bfs && !isNaN(Number(bfs))) {
      try {
        cantonFromBfs = await determineCantonFromBfs(Number(bfs));
        console.log('Canton from BFS:', cantonFromBfs);
      } catch (error) {
        console.warn("Canton determination from BFS failed:", error);
        cantonFromBfs = canton; // Fallback to original canton
      }
    }

    setMunicipalityDetails({
      town,
      canton,
      bfs,
      cantonFromBfs: cantonFromBfs || canton
    });
  };
  const [isPollingVerification, setIsPollingVerification] = useState(false);
  const [acceptedLegalNotice, setAcceptedLegalNotice] = useState(false);
  // Postal suggestions removed - PLZ is now auto-filled by AddressAutocomplete
  const [banner, setBanner] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);

  // Normalisierte Liste aus volksbegehren.json ableiten
  const normalized = useMemo(() => {
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
      // Use the id from the JSON data, fallback to slug or computed id for backward compatibility
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
  const options: Option[] = useMemo(() => {
    if (!type) return [];
    return normalized.filter(i => i.type === type).map(({
      id,
      title
    }) => ({
      id,
      title
    }));
  }, [type, normalized]);


  // Vorbelegung via URL
  useEffect(() => {
    console.log('Preselect data:', preselect);
    console.log('Normalized array:', normalized.map(n => ({ id: n.id, slug: n.slug, type: n.type })));
    if (preselect?.type) {
      setType(preselect.type);
      if (preselect.id) {
        // Find the matching item by both id and slug
        const matchingItem = normalized.find(item => 
          item.id === preselect.id || item.slug === preselect.id
        );
        console.log('Matching item found:', matchingItem);
        if (matchingItem) {
          setSelectedId(matchingItem.id);
          console.log('Set selectedId to:', matchingItem.id);
        } else {
          setSelectedId(preselect.id);
          console.log('No match found, set selectedId to preselect.id:', preselect.id);
        }
      }
    }
  }, [preselect, normalized]);

  const handleIssue = async (credentialData?: {
    given_name?: string;
    family_name?: string;
    birth_date?: string;
  }) => {
    const currentFirstName = credentialData?.given_name || firstName;
    const currentLastName = credentialData?.family_name || lastName;
    const currentBirthDate = credentialData?.birth_date || birthDate;
    if (!type || !selectedId || !currentFirstName || !currentLastName) {
      setBanner({
        type: 'error',
        title: t('errors:validation.missingFields'),
        description: t('errors:validation.fillNameFields')
      });
      return;
    }
    setIsIssuing(true);
    setStatusResult(null);
    try {
      const selectedItem = normalized.find(o => o.type === type && o.id === selectedId);
      const selectedTitle = selectedItem?.title || "";
      const selectedcomitee = selectedItem?.comitee ?? null;
      const selectedLevel = selectedItem?.level ?? null;
      const payload = {
        metadata_credential_supported_id: ["e-collecting-pilot-receipt"],
        credential_subject_data: {
          firstName: currentFirstName || "Wilhelm",
          lastName: currentLastName || "Tell",
          birthDate: currentBirthDate || "12.09.1848",
          signDate: new Date().toISOString().slice(0, 10),
          type,
          title: selectedTitle,
          comitee: selectedcomitee,
          level: selectedLevel
        },
        offer_validity_seconds: 86400,
        credential_valid_from: new Date().toISOString(),
        credential_valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status_lists: statusListUrl ? [statusListUrl] : undefined
      };
      const res = await issuerBusinessAPI.issueCredential(payload);
      setIssuedId(res.id || (res as any).management_id || null);
      setOfferDeeplink(res.offer_deeplink || null);
      setBanner({
        type: 'success',
        title: t('errors:api.credentialCreated'),
        description: `ID: ${res.id || (res as any).management_id}`
      });

      // Set the verified data in state for summary display
      if (credentialData) {
        setFirstName(credentialData.given_name || firstName);
        setLastName(credentialData.family_name || lastName);
        setBirthDate(credentialData.birth_date || birthDate);
      }
      if (municipalityDetails) {
       /* const {
          town = "",
          canton = "",
          bfs = ""
        } = municipalityDetails;
        toast({
          title: "Willensbekundung unterstützt",
          description: `Die Willensbekundung wurde an ${town} ${canton} (BFS: ${bfs}) gesendet.`
        });*/
      }
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('errors:api.credentialError'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    } finally {
      setIsIssuing(false);
    }
  };
  const handleNextFromStep1 = () => {
    if (!type || !selectedId) {
      setBanner({
        type: 'error',
        title: t('errors:validation.missingFields'),
        description: t('errors:validation.selectTypeAndTitle')
      });
      setBanner({
        type: 'error',
        title: t('errors:validation.missingFields'),
        description: t('errors:validation.selectTypeAndTitle')
      });
      return;
    }
    setBanner(null);
    setStep(2);
  };
  // Address validation is now handled by the AddressAutocomplete component
  // via the handleAddressSelect callback which sets municipality and other details
  const handleNextFromStep2 = () => {
    if (!streetAddress || !postalCode || !city) {
      setBanner({
        type: 'error',
        title: t('errors:validation.addressIncomplete'),
        description: t('errors:validation.fillAllAddressFields')
      });
      setBanner({
        type: 'error',
        title: t('errors:validation.addressIncomplete'),
        description: t('errors:validation.fillAllAddressFields')
      });
      return;
    }
    // Address validation already handled by AddressAutocomplete component
    // Municipality details are set via handleAddressSelect callback
    if (municipality) {
      setBanner({
        type: 'info',
        title: t('forms:addressCheck.title', 'Adresse wird geprüft'),
        description: 'Adresse erfolgreich validiert.'
      });
    }
    setStep(3);
  };
  const handleStartVerification = async () => {
    setIsCreatingVerification(true);
    try {
      const verification = await verificationBusinessAPI.createVerification();
      setVerificationId(verification.id);
      setVerificationUrl(verification.verification_url);
      setStep(4);
      setBanner({
        type: 'info',
        title: t('forms:step4.verification.title'),
        description: t('forms:step4.verification.description')
      });
      // Start polling for verification result
      startPollingVerification(verification.id);
      // Entfernt: Toast
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
      });
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
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
          setBanner({
            type: 'success',
            title: t('forms:step4.verification.title'),
            description: t('forms:step4.verification.description')
          });

          // Automatically issue the credential with the verified data
          handleIssue(credentialData);
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
          setIsPollingVerification(false);
          setBanner({
            type: 'error',
            title: t('common:error', 'Fehler'),
            description: t('errors:api.unknownError')
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
      setBanner({
        type: 'success',
        title: t('forms:statusChecked', 'Status abgefragt'),
        description: t('forms:statusUpdated', 'Statusinformationen aktualisiert.')
      });
      // Entfernt: Toast
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
      });
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
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
      // Use localized path instead of hardcoded German path
      const path = getLocalizedPath(currentLang, 'volksbegehren', { id: selected?.slug || selectedId });
      const url = `${window.location.origin}${path}`;
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `${t('forms:shareText', 'Unterstütze')}: ${title}`,
          url
        });
        // Entfernt: Toast
      } else {
        await navigator.clipboard.writeText(url);
        // Entfernt: Toast
      }
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
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
    setStreetAddress("");
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
    // Postal suggestions functionality removed
    setBanner({
      type: 'info',
      title: t('forms.restart', 'Neu starten'),
      description: t('forms.confirmRestartDescription', 'Dadurch werden alle Eingaben gelöscht.')
    });
  };
  // Postal code search functionality removed - now handled by AddressAutocomplete
  const handlePostalCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    setPostalCode(digitsOnly);
  };
  // handleSuggestionClick removed - suggestions handled by AddressAutocomplete
  return <section aria-labelledby="issuer-section">
      <div className="space-y-6 w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full md:w-[806px] mx-auto">
          <div className="text-[32px] leading-[43px] font-semibold text-[#1f2937]">
            {t('forms:step', { current: step, total: 4 })}
          </div>
        </div>


        {/* Alert Banner gemäss Figma */}
        {banner && <div className={
          banner.type === 'success' ? 'border border-green-200 bg-green-50 rounded-lg p-4' :
          banner.type === 'warning' ? 'border border-yellow-200 bg-yellow-50 rounded-lg p-4' :
          banner.type === 'info' ? 'border border-blue-200 bg-blue-50 rounded-lg p-4' :
          'border border-red-200 bg-red-50 rounded-lg p-4'
        }>
          <div className="flex items-start gap-3">
            {banner.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600" />}
            {banner.type === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600" />}
            {banner.type === 'info' && <Info className="w-5 h-5 mt-0.5 text-blue-600" />}
            {banner.type === 'error' && <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />}
            <div>
              <div className={
                banner.type === 'success' ? 'text-green-800 font-semibold' :
                banner.type === 'warning' ? 'text-yellow-800 font-semibold' :
                banner.type === 'info' ? 'text-blue-800 font-semibold' :
                'text-red-800 font-semibold'
              }>{banner.title}</div>
              {banner.description && <div className={
                banner.type === 'success' ? 'text-green-700 text-sm mt-0.5' :
                banner.type === 'warning' ? 'text-yellow-700 text-sm mt-0.5' :
                banner.type === 'info' ? 'text-blue-700 text-sm mt-0.5' :
                'text-red-700 text-sm mt-0.5'
              }>{banner.description}</div>}
            </div>
          </div>
        </div>}

        {/* Action buttons matching screenshot style */}
        

        <div className="space-y-6">
          {/* Success message spans full width */}
          {step === 4 && issuedId && <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">Erfolgreich unterstützt!</h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Sie haben {type === "Initiative" ? "die Initiative" : "das Referendum"} "{options.find(o => o.id === selectedId)?.title}" unterstützt. Wichtiger Hinweis: Dies ist ein Pilotprojekt für E-Collecting mit der Beta-ID des Bundes. Ihre Willensbekundung wird nicht an die zuständige Gemeinde übermittelt. Vielen Dank fürs Ausprobieren!
                </p>
  
              </div>
            </div>}

          <div className={cn("grid gap-6 md:gap-8", issuedId ? "md:grid-cols-2" : "")}> 
            <div className={cn("space-y-4 w-full md:w-[806px]", !issuedId && "mx-auto")}> 

              {step === 1 && <div className="space-y-6 w-full md:w-[806px]">
                  <div className="space-y-4">
                    <Label className="text-[18px] leading-[28px] text-[#1f2937] font-medium">{t('forms:step1.title')}</Label>
                    <CustomSelect
                      options={[
                        { value: "Initiative", label: t('forms:step1.types.initiative') },
                        { value: "Referendum", label: t('forms:step1.types.referendum') }
                      ]}
                      value={type}
                      onValueChange={(v) => setType(v as any)}
                      placeholder={t('forms:step1.selectType')}
                      aria-label={t('forms:step1.selectType')}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-[18px] leading-[28px] text-[#1f2937] font-medium">{t('forms:step1.selectTitle')}</Label>
                    <CustomSelect
                      options={options.map(o => ({ value: o.id, label: o.title }))}
                      value={selectedId}
                      onValueChange={setSelectedId}
                      disabled={!type}
                      placeholder={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                      aria-label={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-stretch sm:justify-end">
                    <button onClick={handleNextFromStep1} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]">
                      {t('common:next')}
                    </button>
                  </div>
                </div>}

              {step === 2 && <div className="space-y-6 w-full md:w-[806px]">
                  <div>
                    <h3 className="text-[22px] leading-[33px] font-semibold mb-4 text-[#1f2937]">{t('forms:step2.title')}</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[18px] leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.street')}</Label>
                        <AddressAutocomplete 
                          value={streetAddress}
                          onValueChange={setStreetAddress}
                          onAddressSelect={handleAddressSelect}
                          placeholder={t('forms:step2.streetPlaceholder')}
                          className="h-12 text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                        <div className="space-y-2 relative sm:col-span-2">
                          <Label className="text-[18px] leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.postalCode')}</Label>
                          <Input value={postalCode} inputMode="numeric" pattern="[0-9]*" onChange={e => handlePostalCodeChange(e.target.value)} placeholder={t('forms:step2.postalCodePlaceholder')} className="h-12 text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
                        </div>
                        <div className="space-y-2 sm:col-span-4">
                          <Label className="text-[18px] leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.city')}</Label>
                          <Input value={city} onChange={e => setCity(e.target.value)} placeholder={t('forms:step2.cityPlaceholder')} className="h-12 text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <button onClick={() => setStep(1)} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]">
                      {t('common:back')}
                    </button>
                    <button onClick={handleNextFromStep2} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]" disabled={isValidatingAddress}>
                      {isValidatingAddress && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />} 
                      {t('common:next')}
                    </button>
                  </div>
                </div>}

              {step === 3 && <div className="space-y-6 w-full md:w-[806px]">
                  <div className="space-y-4">
                    <h3 className="text-[22px] leading-[33px] font-semibold text-[#1f2937]">{t('forms:step3.title')}</h3>
                     
                    <div className="bg-[#f1f4f7] p-4 rounded-[1px] space-y-3 border border-[#e0e4e8]">
                      <div>
                        <Label className="text-[12px] leading-[15px] font-medium text-[#6b7280]">{t('forms:step3.volksbegehren')}</Label>
                        <p className="text-[16px] leading-[24px]">
                          {type} - {options.find(o => o.id === selectedId)?.title}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-[12px] leading-[15px] font-medium text-[#6b7280]">{t('forms:step3.address')}</Label>
                        <p className="text-[16px] leading-[24px]">
                          {streetAddress}<br />
                          {postalCode} {city}
                        </p>
                      </div>
 
                      {municipality && <div>
                          <Label className="text-[12px] leading-[15px] font-medium text-[#6b7280]">{t('forms:step3.municipality')}</Label>
                          <p className="text-[16px] leading-[24px] text-[#1f2937] font-medium">
                            {municipality}
                            {isValidatingAddress && <RefreshCw className="w-3 h-3 ml-2 inline animate-spin" />}
                          </p>
                        </div>}
                    </div>
                  </div>
 
                  <div className="space-y-4 pt-4">
                     {/* Canton validation for non-federal initiatives */}
                     {(() => {
                       const selectedItem = normalized.find(o => o.type === type && o.id === selectedId);
                       const selectedLevel = selectedItem?.level;
                       const userCanton = municipalityDetails?.cantonFromBfs;
                       
                       // Check if initiative level is not "Bund" and we have canton data
                       if (selectedLevel && selectedLevel !== "Bund" && userCanton) {
                         const isCantonMatch = selectedLevel.includes(userCanton) || userCanton.includes(selectedLevel.replace("Kanton ", ""));
                         
                         if (!isCantonMatch) {
                           return (
                            <div className="p-4 border border-red-200 rounded-[1px] bg-red-50">
                              <div className="flex items-start space-x-3">
                                <div className="text-red-600 mt-1">⚠️</div>
                                <div>
                                  <div className="text-[16px] leading-[24px] font-medium text-red-800" role="heading" aria-level={4}>{t('forms:step3.cantonConflict.title')}</div>
                                  <p className="text-[16px] leading-[24px] text-red-700 mt-1" dangerouslySetInnerHTML={{ __html: t('forms:step3.cantonConflict.message', { level: selectedLevel, canton: userCanton }) }}>
                                   </p>
                                </div>
                              </div>
                            </div>
                          );
                         }
                       }
                       return null;
                     })()}
 
                    <div className="flex items-start space-x-3 p-4 border border-[#e0e4e8] rounded-[1px] bg-white">
                      <Checkbox id="legal-notice" checked={acceptedLegalNotice} onCheckedChange={checked => setAcceptedLegalNotice(checked === true)} className="mt-1" />
                      <Label htmlFor="legal-notice" className="text-[16px] leading-[24px] text-[#1f2937] cursor-pointer">
                        {t('forms:step3.legalNotice')}
                      </Label>
                    </div>
 
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button onClick={() => setStep(2)} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]">
                        {t('common:back')}
                      </button>
                      <button 
                        onClick={handleStartVerification} 
                        disabled={
                          !acceptedLegalNotice || 
                          isCreatingVerification || 
                          isValidatingAddress ||
                          (() => {
                            const selectedItem = normalized.find(o => o.type === type && o.id === selectedId);
                            const selectedLevel = selectedItem?.level;
                            const userCanton = municipalityDetails?.cantonFromBfs;
                            
                            // Disable if there's a canton mismatch
                            if (selectedLevel && selectedLevel !== "Bund" && userCanton) {
                              const isCantonMatch = selectedLevel.includes(userCanton) || userCanton.includes(selectedLevel.replace("Kanton ", ""));
                              return !isCantonMatch;
                            }
                            return false;
                          })()
                        }
                        className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]"
                      >
                        {isCreatingVerification && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        {t('forms:step3.supportButton')}
                        <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>}

              {step === 4 && !issuedId && <div className="space-y-6 w-full md:w-[806px]">
                  <div className="space-y-4">
                    <h3 className="text-[22px] leading-[33px] font-semibold text-[#1f2937]">{t('forms:step4.verification.title')}</h3>
                    <p className="text-[16px] leading-[24px] text-[#6b7280]">
                      {t('forms:step4.verification.description')}
                    </p>

                     {verificationUrl && <div className="space-y-4">
                        <div className="bg-white p-6 rounded-[1px] border border-[#e0e4e8] flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={verificationUrl} size={192} />
                          <div className="mt-4 pt-4 border-t">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] no-underline shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]">
                                  {t('forms:step4.verification.openWallet')}
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('forms:step4.verification.dialogTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('forms:step4.verification.dialogDescription')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => window.location.href = `swiyu-verify://?client_id=did:tdw:Qmf9i6m1EFSXmW2jB5JZGW1mPrEsGoRHXN8v8YnqHNEySF:identifier-reg.trust-infra.swiyu-int.admin.ch:api:v1:did:93f3fb23-f7d3-4754-b35c-3686f69ecb64&request_uri=${encodeURIComponent(verificationUrl)}`}>
                                    {t('common:open')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {isPollingVerification && <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t('forms:step4.verification.waitingMessage')}
                          </div>}
                      </div>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <button onClick={() => setStep(3)} disabled={isPollingVerification} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
                      {t('common:back')}
                    </button>
                  </div>
                </div>}

              {step === 4 && issuedId && <div className="space-y-6 w-full md:w-[806px]">
                   <div className="bg-[#f1f4f7] p-4 rounded-[1px] space-y-3 border border-[#e0e4e8]">
                     <div className="font-semibold text-[16px] leading-[24px] text-[#1f2937]" role="heading" aria-level={4}>{t('forms:step4.summary.title')}</div>
                     
                     <div className="grid gap-3 text-[16px] leading-[24px] text-[#1f2937]">
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.date')}</span>
                         <span className="font-medium">{new Date().toLocaleDateString("de-CH")}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.time')}</span>
                         <span className="font-medium">{new Date().toLocaleTimeString("de-CH")}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.firstName')}</span>
                         <span className="font-medium">{firstName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.lastName')}</span>
                         <span className="font-medium">{lastName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.birthDate')}</span>
                         <span className="font-medium">{birthDate}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[#6b7280]">{t('forms:step4.summary.address')}</span>
                         <span className="font-medium">{streetAddress}, {postalCode} {city}</span>
                       </div>
                       {municipalityDetails && <div className="flex justify-between">
                           <span className="text-[#6b7280]">{t('forms:step4.summary.municipality')}</span>
                           <span className="font-medium">
                             {municipalityDetails.town}, {municipalityDetails.cantonFromBfs || municipalityDetails.canton} (BFS: {municipalityDetails.bfs})
                           </span>
                         </div>}
                     </div>
                   </div>
                 </div>}
            </div>

            {issuedId && <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quittung:</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Eine Quittung kann mit der swiyu-Wallet App heruntergeladen werden. Scannen Sie dazu den QR-Code mit Ihrere swiyu-Wallet App. Oder klicken Sie auf Ihrem Smartphone auf den Button.
                  </p>
                  <div className="space-y-4">
                    
                     {offerDeeplink && <div className="space-y-4">
                        <div className="bg-white p-4 rounded-[1px] border flex flex-col items-center justify-center gap-3 text-center">
                          <QRCode value={offerDeeplink} size={192} />
                          <div className="mt-4 pt-4 border-t">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px] no-underline">
                                  Quittung herunterladen
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>swiyu-Wallet öffnen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bitte anschliessend wieder auf diese Seite zurückkehren.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => window.location.href = offerDeeplink}>
                                    {t('forms.open', 'Öffnen')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>}
                  </div>
                </div>
              </div>}
          </div>

          {/* Action buttons span full width below columns */}
          {step === 4 && issuedId && <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]">{t('forms.restart', 'Neu starten')}</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('forms.confirmRestart', 'Neustart bestätigen')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('forms.confirmRestartDescription', 'Dadurch werden alle Eingaben gelöscht. Möchten Sie fortfahren?')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('forms.cancel', 'Abbrechen')}</AlertDialogCancel>
                    <AlertDialogAction onClick={resetForm}>{t('forms.deleteAndRestart', 'Löschen und neu starten')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <button onClick={handleShare} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]">
                <Share2 className="w-4 h-4 mr-2" /> {t('forms:shareVolksbegehren', 'Volksbegehren teilen')}
              </button>
            </div>}
        </div>
      </div>
    </section>;
}