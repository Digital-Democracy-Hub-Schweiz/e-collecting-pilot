import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { verificationBusinessAPI } from "@/services/verificationAPI";
// import { useToast } from "@/hooks/use-toast";
import { useVolksbegehren } from "@/hooks/use-volksbegehren";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { ShieldCheck, QrCode, RefreshCw, Share2, AlertTriangle, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";
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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
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
  // Legal notice checkbox removed; button always enabled
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

  // Selected item and level display mapping for summary
  const selectedItem = useMemo(() => {
    return normalized.find(o => o.type === type && o.id === selectedId) || null;
  }, [normalized, type, selectedId]);
  const levelDisplay = useMemo(() => {
    return selectedItem?.level ?? '';
  }, [selectedItem]);


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
        title: t('forms:submissionSuccess', 'Volksbegehren erfolgreich eingereicht.'),
        description: undefined
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
        type: 'warning',
        title: t('errors:validation.missingFields'),
        description: t('errors:validation.selectTypeAndTitle')
      });
      setBanner({
        type: 'warning',
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
        type: 'warning',
        title: t('errors:validation.addressIncomplete'),
        description: t('errors:validation.fillAllAddressFields')
      });
      setBanner({
        type: 'warning',
        title: t('errors:validation.addressIncomplete'),
        description: t('errors:validation.fillAllAddressFields')
      });
      return;
    }
    // Address validation already handled by AddressAutocomplete component
    // Municipality details are set via handleAddressSelect callback
    // Clear any existing banner when going to step 3
    setBanner(null);
    setStep(3);
  };
  const handleStartVerification = async () => {
    setIsCreatingVerification(true);
    // Entfernt: Address validation banner & step 4 info banner
    try {
      const verification = await verificationBusinessAPI.createVerification();
      setVerificationId(verification.id);
      setVerificationUrl(verification.verification_url);
      setStep(4);
      setBanner(null);
      
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
            {t('forms:step', { current: step, total: 5 })}
          </div>
        </div>


        {/* Alert Banner gemäss Figma */}
        {banner && (
          <div className={
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

        {/* Action buttons matching screenshot style */}
        

        <div className="space-y-6">
          {/* Entfernt: Erfolgsmeldung in Schritt 4 */}
          {null}

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
                    <button onClick={() => { setBanner(null); setStep(1); }} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]">
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
                    <div className="bg-white px-12 py-6">
                      {/* Volksbegehren Section */}
                      <div className="py-4">
                        <div className="text-[32px] leading-[43px] font-semibold text-[#1f2937]">{t('forms:step3.sectionVolksbegehren', 'Volksbegehren')}</div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:type', 'Typ')}:</div>
                          <div className="w-[441px] text-[22px] leading-[33px] text-[#1f2937] font-medium">{type || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:title', 'Titel')}:</div>
                          <div className="w-[441px] text-[22px] leading-[33px] text-[#1f2937] font-medium break-words">{options.find(o => o.id === selectedId)?.title || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:level.label', 'Ebene')}:</div>
                          <div className="w-[441px] text-[22px] leading-[33px] text-[#1f2937] font-medium">{levelDisplay || '—'}</div>
                        </div>
                      </div>

                      {/* Adressdaten Section */}
                      <div className="py-4 mt-8">
                        <div className="text-[32px] leading-[43px] font-semibold text-[#1f2937]">{t('forms:step3.sectionAddressData', 'Adressdaten')}</div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:step2.street', 'Strasse / Nr.')}:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">{streetAddress || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:step2.postalCode', 'PLZ')}:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">{postalCode || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:step2.city', 'Ort')}:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">{city || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">{t('forms:step3.municipality', 'Politische Gemeinde')}:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">{municipalityDetails?.town || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">BFS-Nr.:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">{municipalityDetails?.bfs || '—'}</div>
                        </div>
                        <div className="flex gap-10 items-start py-6">
                          <div className="w-[229px] text-[#1f2937] text-[22px] leading-[33px] font-semibold">Kanton:</div>
                          <div className="grow text-[22px] leading-[33px] text-[#1f2937] font-medium">
                            {municipalityDetails?.cantonFromBfs || municipalityDetails?.canton || '—'}
                            {isValidatingAddress && <RefreshCw className="w-4 h-4 ml-2 inline align-middle animate-spin" />}
                          </div>
                        </div>
                      </div>
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
 
                    <div className="bg-[#fff7ed] p-6 rounded-[3px] shadow-[0px_2px_6px_-1px_rgba(17,24,39,0.08)]">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Info className="w-8 h-8 text-[#9a3412]" />
                          </div>
                          <p className="text-[20px] leading-[32px] text-[#9a3412] font-medium">
                            {t('forms:step3.legalNotice')}
                          </p>
                        </div>
                      </div>
 
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button onClick={() => { setBanner(null); setStep(2); }} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]">
                        {t('common:back')}
                      </button>
                      <button 
                        onClick={handleStartVerification} 
                        disabled={
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

              {step === 4 && !issuedId && (
                <div className="space-y-6 w-full md:w-[806px]">
                  <div className="space-y-4">
                    <div className="bg-white px-12 py-6">
                      <div className="py-4">
                        <div className="text-[32px] leading-[43px] font-semibold text-[#1f2937]">{t('forms:step4.verification.title')}</div>
                      </div>
                      <div className="text-[18px] leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                        {t('forms:step4.verification.description')}
                      </div>
                      {verificationUrl && (
                        <div className="flex items-center justify-center py-6">
                          <QRCode value={verificationUrl} size={192} />
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                        <button
                          onClick={() => { setBanner(null); setStep(3); }}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[20px]"
                        >
                          {t('common:back')}
                        </button>
                        <button
                          onClick={() => verificationUrl && (window.location.href = `swiyu-verify://?client_id=did:tdw:Qmf9i6m1EFSXmW2jB5JZGW1mPrEsGoRHXN8v8YnqHNEySF:identifier-reg.trust-infra.swiyu-int.admin.ch:api:v1:did:93f3fb23-f7d3-4754-b35c-3686f69ecb64&request_uri=${encodeURIComponent(verificationUrl)}`)}
                          disabled={!verificationUrl}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('forms:step4.verification.openWallet')}
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && issuedId && (
                <div className="space-y-6 w-full md:w-[806px]">
                  <div className="space-y-4">
                    <div className="bg-white px-12 py-6">
                      <div className="text-[18px] leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                        Eine Quittung kann mit der swiyu-Wallet App heruntergeladen werden. Scannen Sie dazu den QR-Code mit Ihrere swiyu-Wallet App. Oder klicken Sie auf Ihrem Smartphone auf den Button.
                      </div>
                      {offerDeeplink && (
                        <div className="flex items-center justify-center py-6">
                          <QRCode value={offerDeeplink} size={192} />
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                        <button
                          onClick={() => offerDeeplink && (window.location.href = offerDeeplink)}
                          disabled={!offerDeeplink}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Quittung herunterladen
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </button>
                        <button
                          onClick={handleShare}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] hover:bg-[#4c5967] transition-colors font-semibold h-12 text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]"
                        >
                          <Share2 className="w-4 h-4 mr-2" /> {t('forms:shareVolksbegehren', 'Volksbegehren teilen')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Entfernt: Rechte Spalte Quittung in Schritt 4 */}
            {null}
          </div>

          {/* Entfernt: Aktionen unten in Schritt 4 */}
          {null}
        </div>
      </div>
    </section>;
}