import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ErrorBadge } from "@/components/ui/error-badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { verificationBusinessAPI } from "@/services/verificationAPI";
// import { useToast } from "@/hooks/use-toast";
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
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const statusListUrl = "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/3e6fc90b-bb80-4112-aa4e-940cda4616d7.jwt";
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const isValidatingAddress = false;
  const [municipalityDetails, setMunicipalityDetails] = useState<{
    town: string;
    canton: string;
    bfs: string;
    cantonFromBfs?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    type?: string;
    selectedId?: string;
    streetAddress?: string;
    postalCode?: string;
    city?: string;
  }>({});
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    given_name?: string;
    family_name?: string;
    birth_date?: string;
    signatures?: any;
  } | null>(null);
  const stepTitleRef = useRef<HTMLHeadingElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Handler for address selection
  const handleAddressSelect = async (address: AddressHit) => {
    // console.log('Address selected:', address);
    setStreetAddress(address.place.postalAddress.streetAddress);
    setPostalCode(address.place.postalAddress.postalCode);
    setCity(address.place.postalAddress.addressLocality);
    setFieldErrors(prev => ({ ...prev, streetAddress: undefined, postalCode: undefined, city: undefined }));
    
    // Set municipality code for further processing
    const municipalityCode = address.place.additionalProperty.municipalityCode;
    // console.log('Municipality code:', municipalityCode);
    // Set municipality details including canton determination
    const town = address.place.postalAddress.addressLocality;
    const canton = address.place.postalAddress.addressRegion || "";
    const bfs = municipalityCode;

    // Determine canton from BFS code if available
    let cantonFromBfs = "";
    if (bfs && !isNaN(Number(bfs))) {
      try {
        cantonFromBfs = await determineCantonFromBfs(Number(bfs));
        // console.log('Canton from BFS:', cantonFromBfs);
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
    // console.log('Preselect data:', preselect);
    // console.log('Normalized array:', normalized.map(n => ({ id: n.id, slug: n.slug, type: n.type })));
    if (preselect?.type) {
      setType(preselect.type);
      if (preselect.id) {
        // Find the matching item by both id and slug
        const matchingItem = normalized.find(item => 
          item.id === preselect.id || item.slug === preselect.id
        );
        // console.log('Matching item found:', matchingItem);
        if (matchingItem) {
          setSelectedId(matchingItem.id);
          // console.log('Set selectedId to:', matchingItem.id);
        } else {
          setSelectedId(preselect.id);
          // console.log('No match found, set selectedId to preselect.id:', preselect.id);
        }
      }
    }
  }, [preselect, normalized]);

  // Move focus to the step title when the step changes to improve SR/keyboard UX
  // Only focus from step 2 onwards, not on the first page
  useEffect(() => {
    if (step > 1) {
      // Delay to ensure DOM is updated before focusing
      requestAnimationFrame(() => {
        stepTitleRef.current?.focus();
      });
    }
  }, [step]);

  // Focus error/warning banner when it appears (validation/network errors)
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
      setStep(5);

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
    }
  };
  const handleNextFromStep1 = () => {
    const missingType = !type;
    const missingTitle = !selectedId;
    if (missingType || missingTitle) {
      const nextErrors: typeof fieldErrors = {};
      if (missingType) nextErrors.type = t('errors:validation.required');
      if (missingTitle) nextErrors.selectedId = t('errors:validation.required');
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
    setStep(2);
  };
  // Address validation is now handled by the AddressAutocomplete component
  // via the handleAddressSelect callback which sets municipality and other details
  const handleNextFromStep2 = () => {
    if (!streetAddress || !postalCode || !city) {
      const nextErrors: typeof fieldErrors = {};
      if (!streetAddress) nextErrors.streetAddress = `${t('errors:validation.required')}: ${t('forms:step2.street')}`;
      if (!postalCode) nextErrors.postalCode = `${t('errors:validation.required')}: ${t('forms:step2.postalCode')}`;
      if (!city) nextErrors.city = `${t('errors:validation.required')}: ${t('forms:step2.city')}`;
      setFieldErrors(prev => ({ ...prev, ...nextErrors }));
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
    setFieldErrors({});
    setStep(3);
  };
  const handleStartVerification = async () => {
    setIsCreatingVerification(true);
    // Entfernt: Address validation banner & step 4 info banner
    try {
      const verification = await verificationBusinessAPI.createVerification();
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
    const pollInterval = setInterval(async () => {
      try {
        const result = await verificationBusinessAPI.getVerification(verificationId);
        if (result.state === 'SUCCESS' && result.wallet_response) {
          clearInterval(pollInterval);

          // Extract data from wallet response
          const credentialData = result.wallet_response?.credential_subject_data;
          const signatures = result.wallet_response?.signatures || result.wallet_response;
          
          if (credentialData) {
            setVerificationData({
              given_name: credentialData.given_name || "",
              family_name: credentialData.family_name || "",
              birth_date: credentialData.birth_date || "",
              signatures: signatures
            });
            setFirstName(credentialData.given_name || "");
            setLastName(credentialData.family_name || "");
            setBirthDate(credentialData.birth_date || "");
          }
          setBanner({
            type: 'success',
            title: t('forms:step4.verification.title'),
            description: t('forms:step4.verification.description')
          });

          // Navigate to step 3 to show verification data instead of auto-issuing
          setStep(3);
        } else if (result.state === 'FAILED') {
          clearInterval(pollInterval);
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
    }, 300000);
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
      } else {
        await navigator.clipboard.writeText(url);
      }
      // Show success modal
      setShareModalOpen(true);
    } catch (e: any) {
      setBanner({
        type: 'error',
        title: t('common:error', 'Fehler'),
        description: e?.message ?? t('errors:api.unknownError')
      });
    }
  };
  // Postal code search functionality removed - now handled by AddressAutocomplete
  const handlePostalCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    setPostalCode(digitsOnly);
  };
  // handleSuggestionClick removed - suggestions handled by AddressAutocomplete
  return <section aria-labelledby="issuer-section">
      <div className="space-y-4 sm:space-y-6 w-full max-w-[960px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="w-full">
          <h1
            id="issuer-section"
            ref={stepTitleRef}
            tabIndex={-1}
            className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] md:text-[32px] md:leading-[43px] font-semibold text-[#1f2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2937]/40"
          >
            {t('forms:step', { current: step, total: 5 })}
          </h1>
        </div>


        {/* Alert Banner gemäss Figma */}
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

        {/* Action buttons matching screenshot style */}
        

        <div className="space-y-6">
          {/* Entfernt: Erfolgsmeldung in Schritt 4 */}
          {null}

          <div className={cn("grid gap-6 md:gap-8", issuedId && step !== 5 ? "md:grid-cols-2" : "")}> 
            <div className="space-y-4 w-full">

              {step === 1 && (
                <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">{t('forms:step1.title')}</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type-select" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">{t('forms:step1.selectType')}</Label>
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
                            setSelectedId("");
                            setFieldErrors(prev => ({ ...prev, type: undefined, selectedId: undefined }));
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
                        <Label htmlFor="title-select" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">{t('forms:step1.selectTitle')}</Label>
                        <NativeSelect
                          id="title-select"
                          options={options.map(o => {
                            const titleVariants = createTitleVariants(o.title, 45);
                            return { 
                              value: o.id, 
                              label: o.title, // Full title for dropdown options
                              displayLabel: titleVariants.short // Short title for input field display
                            };
                          })}
                          value={selectedId}
                          onValueChange={(v) => { setSelectedId(v); setFieldErrors(prev => ({ ...prev, selectedId: undefined })); }}
                          disabled={!type}
                          placeholder={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                          aria-label={type ? t('forms:step1.selectTitlePlaceholder') : t('forms:step1.selectTypeFirst')}
                          className="w-full"
                        />
                        {fieldErrors.selectedId && (
                          <ErrorBadge role="alert" aria-live="polite">{fieldErrors.selectedId}</ErrorBadge>
                        )}
                        
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                    <Button
                      variant="filled"
                      size="xl"
                      onClick={handleNextFromStep1}
                      className="w-full sm:w-auto"
                    >
                      {t('common:next')}
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>
              )} 

              {step === 2 && <div className="space-y-6 w-full">
                  <div>
                    <h2 className="text-[20px] leading-[32px] sm:text-[22px] sm:leading-[33px] font-semibold mb-4 text-[#1f2937]">{t('forms:step2.title')}</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street-address" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.street')}</Label>
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
                          <Label htmlFor="postal-code" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.postalCode')}</Label>
                          <Input id="postal-code" value={postalCode} inputMode="numeric" pattern="[0-9]*" onChange={e => { handlePostalCodeChange(e.target.value); setFieldErrors(prev => ({ ...prev, postalCode: undefined })); }} placeholder={t('forms:step2.postalCodePlaceholder')} className="h-12 text-[16px] sm:text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
                          {fieldErrors.postalCode && (
                            <ErrorBadge role="alert" aria-live="polite">{fieldErrors.postalCode}</ErrorBadge>
                          )}
                        </div>
                        <div className="space-y-2 sm:col-span-4">
                          <Label htmlFor="city" className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#1f2937] font-medium">{t('forms:step2.city')}</Label>
                          <Input id="city" value={city} onChange={e => { setCity(e.target.value); setFieldErrors(prev => ({ ...prev, city: undefined })); }} placeholder={t('forms:step2.cityPlaceholder')} className="h-12 text-[16px] sm:text-[18px] border-[#6b7280] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
                          {fieldErrors.city && (
                            <ErrorBadge role="alert" aria-live="polite">{fieldErrors.city}</ErrorBadge>
                          )}
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
                      onClick={handleNextFromStep2}
                      disabled={isValidatingAddress}
                      className="w-full sm:w-auto"
                    >
                      {isValidatingAddress && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />} 
                      {t('common:next')}
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                    </Button>
                  </div>
                </div>}

              {step === 3 && <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      {/* Volksbegehren Section */}
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">{t('forms:step3.sectionVolksbegehren', 'Volksbegehren')}</div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:type', 'Typ')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{type || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:title', 'Titel')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium break-words">{options.find(o => o.id === selectedId)?.title || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:level.label', 'Ebene')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{levelDisplay || '—'}</div>
                        </div>
                      </div>

                      {/* Adressdaten Section */}
                      <div className="py-4 mt-8">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">{t('forms:step3.sectionAddressData', 'Adressdaten')}</div>
                      </div>
                      <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:step2.street', 'Strasse / Nr.')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{streetAddress || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:step2.postalCode', 'PLZ')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{postalCode || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:step2.city', 'Ort')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{city || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:step3.municipality', 'Politische Gemeinde')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{municipalityDetails?.town || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">BFS-Nr.:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{municipalityDetails?.bfs || '—'}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                          <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">{t('forms:step3.canton', 'Kanton')}:</div>
                          <div className="w-full sm:w-[441px] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">
                            {municipalityDetails?.cantonFromBfs || municipalityDetails?.canton || '—'}
                            {isValidatingAddress && <RefreshCw className="w-4 h-4 ml-2 inline align-middle animate-spin" />}
                          </div>
                        </div>
                      </div>

                      {/* Verifizierte Attribute Section - only show when verification data exists */}
                      {verificationData && (
                        <>
                          <div className="py-4 mt-8">
                            <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">Verifizierte Attribute</div>
                          </div>
                          <div className="border-t border-[#adb4bc] divide-y divide-[#adb4bc]">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                              <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">Vorname:</div>
                              <div className="w-full sm:w-[441px] space-y-2">
                                <div className="text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{verificationData.given_name || '—'}</div>
                                {verificationData.signatures?.given_name && (
                                  <div className="text-[14px] leading-[20px] text-[#6b7280] font-mono break-all bg-[#f5f6f7] p-2 rounded">
                                    <div className="font-semibold mb-1">Signatur:</div>
                                    {JSON.stringify(verificationData.signatures.given_name, null, 2)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                              <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">Nachname:</div>
                              <div className="w-full sm:w-[441px] space-y-2">
                                <div className="text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{verificationData.family_name || '—'}</div>
                                {verificationData.signatures?.family_name && (
                                  <div className="text-[14px] leading-[20px] text-[#6b7280] font-mono break-all bg-[#f5f6f7] p-2 rounded">
                                    <div className="font-semibold mb-1">Signatur:</div>
                                    {JSON.stringify(verificationData.signatures.family_name, null, 2)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start py-6">
                              <div className="w-full sm:w-[229px] text-[#1f2937] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] font-semibold">Geburtsdatum:</div>
                              <div className="w-full sm:w-[441px] space-y-2">
                                <div className="text-[18px] leading-[28px] sm:text-[22px] sm:leading-[33px] text-[#1f2937] font-medium">{verificationData.birth_date || '—'}</div>
                                {verificationData.signatures?.birth_date && (
                                  <div className="text-[14px] leading-[20px] text-[#6b7280] font-mono break-all bg-[#f5f6f7] p-2 rounded">
                                    <div className="font-semibold mb-1">Signatur:</div>
                                    {JSON.stringify(verificationData.signatures.birth_date, null, 2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
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
                      <Button
                        variant="bare"
                        size="xl"
                        onClick={() => { 
                          setBanner(null); 
                          setVerificationData(null);
                          setStep(2); 
                        }}
                        className="w-full sm:w-auto"
                      >
                        {t('common:back')}
                      </Button>
                      {!verificationData ? (
                        <Button
                          variant="filled"
                          size="xl"
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
                          className="w-full sm:w-auto"
                        >
                          {isCreatingVerification && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
                          {t('forms:step3.supportButton')}
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </Button>
                      ) : (
                        <Button
                          variant="filled"
                          size="xl"
                          onClick={() => handleIssue(verificationData)}
                          className="w-full sm:w-auto"
                        >
                          Weiter zu Schritt 4
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>}

              {step === 4 && !issuedId && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">{t('forms:step4.verification.title')}</div>
                      </div>
                      <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
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
                          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#1f2937] border border-[#e0e4e8] rounded-[1px] hover:bg-[#f5f6f7] transition-colors font-medium h-12 text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px]"
                        >
                          {t('common:back')}
                        </button>
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
                  </div>
                </div>
              )}

              {step === 5 && issuedId && (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                      <div className="py-4">
                        <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[43px] font-semibold text-[#1f2937]">{t('forms:step5.success.title')}</div>
                      </div>
                      <div className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[22px] md:leading-[33px] text-[#1f2937] font-medium mb-6">
                        Eine Quittung kann mit der swiyu-Wallet App heruntergeladen werden. Scannen Sie dazu den QR-Code mit Ihrere swiyu-Wallet App. Oder klicken Sie auf Ihrem Smartphone auf den Button.
                      </div>
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
                          Quittung herunterladen
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
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

      {/* Modal: Link erfolgreich kopiert */}
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
    </section>;
}
