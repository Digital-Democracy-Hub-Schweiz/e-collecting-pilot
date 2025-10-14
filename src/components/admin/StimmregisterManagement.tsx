import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { gemeindeIssuerAPI } from "@/services/gemeindeIssuerAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Ban, Plus, RefreshCw, Search } from "lucide-react";
import QRCode from "react-qr-code";

interface Gemeinde {
  id: string;
  name: string;
  did: string | null;
}

interface Einwohner {
  id: string;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
}

interface Volksbegehren {
  id: string;
  title_de: string;
  slug: string;
  end_date: string | null;
}

interface Credential {
  id: string;
  einwohner_id: string;
  volksbegehren_id: string;
  status: string;
  offer_deeplink: string | null;
  management_id: string | null;
  credential_id: string | null;
  issued_at: string;
  issued_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  nullifier?: string | null;
  issuer_did?: string | null;
  issued_date?: string | null;
  credential_valid_from?: string | null;
  credential_valid_until?: string | null;
  einwohner?: {
    id: string;
    vorname: string;
    nachname: string;
    geburtsdatum: string;
    gemeinde_id: string;
  };
  volksbegehren?: {
    id: string;
    title_de: string;
    slug: string;
  };
}

interface StimmregisterManagementProps {
  userId: string;
}

const StimmregisterManagement = ({ userId }: StimmregisterManagementProps) => {
  const [gemeinden, setGemeinden] = useState<Gemeinde[]>([]);
  const [einwohner, setEinwohner] = useState<Einwohner[]>([]);
  const [volksbegehren, setVolksbegehren] = useState<Volksbegehren[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedGemeindeId, setSelectedGemeindeId] = useState<string>("");
  const [selectedEinwohnerId, setSelectedEinwohnerId] = useState<string>("");
  const [selectedVolksbegehrenId, setSelectedVolksbegehrenId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCredential, setViewCredential] = useState<Credential | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [credentialDetails, setCredentialDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [issuedOfferDeeplink, setIssuedOfferDeeplink] = useState<string | null>(null);
  
  // Filter states
  const [filterGemeindeId, setFilterGemeindeId] = useState<string>("all");
  const [filterVolksbegehrenId, setFilterVolksbegehrenId] = useState<string>("all");
  const [searchVorname, setSearchVorname] = useState<string>("");
  const [searchNachname, setSearchNachname] = useState<string>("");
  const [searchGeburtsdatum, setSearchGeburtsdatum] = useState<string>("");

  useEffect(() => {
    fetchGemeinden();
    fetchVolksbegehren();
  }, [userId]);

  useEffect(() => {
    if (selectedGemeindeId) {
      fetchEinwohner();
    }
  }, [selectedGemeindeId]);

  useEffect(() => {
    if (selectedGemeindeId) {
      fetchCredentials();
    }
  }, [selectedGemeindeId]);

  const fetchGemeinden = async () => {
    const { data, error } = await supabase
      .from("gemeinden")
      .select("id, name, did")
      .order("name");

    if (error) {
      console.error("Error fetching gemeinden:", error);
    } else {
      setGemeinden(data || []);
      if (data && data.length > 0) {
        setSelectedGemeindeId(data[0].id);
      }
    }
  };

  const fetchEinwohner = async () => {
    if (!selectedGemeindeId) return;

    const { data, error } = await supabase
      .from("einwohner")
      .select("id, vorname, nachname, geburtsdatum")
      .eq("gemeinde_id", selectedGemeindeId)
      .order("nachname");

    if (error) {
      console.error("Error fetching einwohner:", error);
    } else {
      setEinwohner(data || []);
    }
  };

  const fetchVolksbegehren = async () => {
    const { data, error } = await supabase
      .from("volksbegehren")
      .select("id, title_de, slug, end_date")
      .eq("status", "active")
      .order("title_de");

    if (error) {
      console.error("Error fetching volksbegehren:", error);
    } else {
      setVolksbegehren(data || []);
    }
  };

  const fetchCredentials = async () => {
    // Fetch all credentials with joined data
    const { data, error } = await supabase
      .from("credentials")
      .select(`
        *,
        einwohner:einwohner_id (
          id,
          vorname,
          nachname,
          geburtsdatum,
          gemeinde_id
        ),
        volksbegehren:volksbegehren_id (
          id,
          title_de,
          slug
        )
      `)
      .order("issued_at", { ascending: false });

    if (error) {
      console.error("Error fetching credentials:", error);
    } else {
      setCredentials(data || []);
    }
  };

  const handleIssueCredential = async () => {
    if (!selectedEinwohnerId || !selectedVolksbegehrenId) {
      toast.error("Bitte wählen Sie einen Einwohner und ein Volksbegehren aus");
      return;
    }

    setLoading(true);

    try {
      // Check if credential already exists for this combination
      const { data: existingCredential, error: checkError } = await supabase
        .from("credentials")
        .select("id")
        .eq("einwohner_id", selectedEinwohnerId)
        .eq("volksbegehren_id", selectedVolksbegehrenId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingCredential) {
        toast.error("Für diese Kombination von Einwohner und Volksbegehren existiert bereits ein Stimmrechtsausweis");
        setLoading(false);
        return;
      }

      const selectedEinwohner = einwohner.find((e) => e.id === selectedEinwohnerId);
      const selectedVolksbegehren = volksbegehren.find((v) => v.id === selectedVolksbegehrenId);
      const selectedGemeinde = gemeinden.find((g) => g.id === selectedGemeindeId);

      if (!selectedEinwohner || !selectedVolksbegehren || !selectedGemeinde) {
        throw new Error("Einwohner, Volksbegehren oder Gemeinde nicht gefunden");
      }

      if (!selectedGemeinde.did) {
        toast.error("Gemeinde hat keine DID konfiguriert");
        setLoading(false);
        return;
      }

      // Generate nullifier (hash of einwohner_id + volksbegehren_id + gemeinde_id)
      const nullifierInput = `${selectedEinwohnerId}${selectedVolksbegehrenId}${selectedGemeindeId}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(nullifierInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const nullifier = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Calculate valid_until date from volksbegehren end_date or default to 1 year
      const validUntil = selectedVolksbegehren.end_date 
        ? new Date(selectedVolksbegehren.end_date).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const issuedDate = new Date().toISOString().slice(0, 10);
      const validFrom = new Date().toISOString();

      // Statusliste URL
      const statusListUrl = "https://status-reg.trust-infra.swiyu-int.admin.ch/api/v1/statuslist/8e4f0f38-f2ed-453c-899d-e5619535efe2.jwt";

      // Issue credential via Gemeinde API (Backend erwartet leeres credential_subject_data)
      const response = await gemeindeIssuerAPI.issueCredential({
        metadata_credential_supported_id: ["stimmregister-vc"],
        credential_subject_data: {},
        offer_validity_seconds: 86400,
        credential_valid_from: validFrom,
        credential_valid_until: validUntil,
        status_lists: statusListUrl ? [statusListUrl] : undefined
      });

      // Save to database with all credential details
      const { error } = await supabase.from("credentials").insert({
        einwohner_id: selectedEinwohnerId,
        volksbegehren_id: selectedVolksbegehrenId,
        management_id: response.management_id,
        offer_deeplink: response.offer_deeplink,
        credential_id: response.id,
        status: "issued",
        issued_by: userId,
        nullifier: nullifier,
        issuer_did: selectedGemeinde.did,
        issued_date: issuedDate,
        credential_valid_from: validFrom,
        credential_valid_until: validUntil
      });

      if (error) throw error;

      toast.success("Stimmrechtsausweis erfolgreich ausgestellt");
      
      // Show QR code dialog
      setIssuedOfferDeeplink(response.offer_deeplink);
      setShowQRDialog(true);
      
      fetchCredentials();
      setSelectedEinwohnerId("");
      setSelectedVolksbegehrenId("");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Ausstellen des Ausweises");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCredential = async (credential: Credential) => {
    if (!confirm("Möchten Sie diesen Ausweis wirklich widerrufen?")) return;

    setLoading(true);

    try {
      // Call revoke API using Gemeinde service
      if (credential.management_id) {
        await gemeindeIssuerAPI.revokeCredential(credential.management_id);
      }

      // Update database
      const { error } = await supabase
        .from("credentials")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: userId,
        })
        .eq("id", credential.id);

      if (error) throw error;

      toast.success("Ausweis erfolgreich widerrufen");
      fetchCredentials();
      setViewCredential(null);
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Widerrufen des Ausweises");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentialStatus = async (credentialId: string, managementId: string | null) => {
    if (!managementId) {
      toast.error("Keine Management-ID vorhanden");
      return;
    }

    setUpdatingStatus(credentialId);
    try {
      const statusResponse = await gemeindeIssuerAPI.checkCredentialStatus(managementId);
      
      const { error } = await supabase
        .from("credentials")
        .update({ 
          status: statusResponse.status || "unknown" 
        })
        .eq("id", credentialId);

      if (error) throw error;

      toast.success("Status erfolgreich aktualisiert");
      fetchCredentials();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Aktualisieren des Status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const loadCredentialDetails = async (managementId: string) => {
    setLoadingDetails(true);
    try {
      const details = await gemeindeIssuerAPI.getCredentialDetails(managementId);
      setCredentialDetails(details);
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Laden der Details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewCredential = (credential: Credential) => {
    setViewCredential(credential);
    setCredentialDetails(null);
    setSelectedStatus(credential.status || "");
    if (credential.management_id) {
      loadCredentialDetails(credential.management_id);
    }
  };

  const handleUpdateStatus = async () => {
    if (!viewCredential?.management_id || !selectedStatus) return;

    setLoadingDetails(true);
    try {
      await gemeindeIssuerAPI.updateCredentialStatus(
        viewCredential.management_id,
        selectedStatus
      );

      // Update in database
      const { error } = await supabase
        .from("credentials")
        .update({ status: selectedStatus.toLowerCase() })
        .eq("id", viewCredential.id);

      if (error) throw error;

      toast.success("Status aktualisiert", {
        description: `Status wurde auf ${selectedStatus} geändert.`,
      });

      await fetchCredentials();
      
      // Update local viewCredential state
      setViewCredential(prev => prev ? { ...prev, status: selectedStatus.toLowerCase() } : null);
      
      if (viewCredential.management_id) {
        await loadCredentialDetails(viewCredential.management_id);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Fehler", {
        description: "Status konnte nicht aktualisiert werden.",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter credentials
  const filteredCredentials = credentials.filter((credential) => {
    const credentialEinwohner = credential.einwohner;
    const credentialVolksbegehren = credential.volksbegehren;
    
    // Gemeinde filter
    if (filterGemeindeId !== "all" && credentialEinwohner?.gemeinde_id !== filterGemeindeId) {
      return false;
    }
    
    // Volksbegehren filter
    if (filterVolksbegehrenId !== "all" && credential.volksbegehren_id !== filterVolksbegehrenId) {
      return false;
    }
    
    // Vorname search
    if (searchVorname && !credentialEinwohner?.vorname?.toLowerCase().includes(searchVorname.toLowerCase())) {
      return false;
    }
    
    // Nachname search
    if (searchNachname && !credentialEinwohner?.nachname?.toLowerCase().includes(searchNachname.toLowerCase())) {
      return false;
    }
    
    // Geburtsdatum search
    if (searchGeburtsdatum && !credentialEinwohner?.geburtsdatum?.includes(searchGeburtsdatum)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Stimmregister</CardTitle>
              {selectedGemeindeId && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Ausweis ausstellen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Stimmrechtsausweis ausstellen</DialogTitle>
                      <DialogDescription>
                        Stellen Sie einen Stimmrechtsausweis für einen Einwohner aus
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Einwohner</label>
                        <Select value={selectedEinwohnerId} onValueChange={setSelectedEinwohnerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie einen Einwohner" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="z-[100] pointer-events-auto">
                            {einwohner.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.vorname} {person.nachname} (
                                {new Date(person.geburtsdatum).toLocaleDateString("de-CH")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Volksbegehren</label>
                        <Select
                          value={selectedVolksbegehrenId}
                          onValueChange={setSelectedVolksbegehrenId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie ein Volksbegehren" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="z-[100] pointer-events-auto">
                            {volksbegehren.map((vb) => (
                              <SelectItem key={vb.id} value={vb.id}>
                                {vb.title_de}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleIssueCredential}
                        disabled={loading || !selectedEinwohnerId || !selectedVolksbegehrenId}
                        className="w-full"
                      >
                        {loading ? "Wird ausgestellt..." : "Ausweis ausstellen"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gemeinde</label>
                <Select value={filterGemeindeId} onValueChange={setFilterGemeindeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Gemeinden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Gemeinden</SelectItem>
                    {gemeinden.map((gemeinde) => (
                      <SelectItem key={gemeinde.id} value={gemeinde.id}>
                        {gemeinde.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Volksbegehren</label>
                <Select value={filterVolksbegehrenId} onValueChange={setFilterVolksbegehrenId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Volksbegehren" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Volksbegehren</SelectItem>
                    {volksbegehren.map((vb) => (
                      <SelectItem key={vb.id} value={vb.id}>
                        {vb.title_de}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vorname</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen..."
                    value={searchVorname}
                    onChange={(e) => setSearchVorname(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nachname</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen..."
                    value={searchNachname}
                    onChange={(e) => setSearchNachname(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Geburtsdatum</label>
                <Input
                  type="date"
                  value={searchGeburtsdatum}
                  onChange={(e) => setSearchGeburtsdatum(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {filteredCredentials.length === 0 ? (
              <p className="text-muted-foreground">
                {credentials.length === 0 
                  ? "Keine Ausweise vorhanden" 
                  : "Keine Ausweise mit den gewählten Filtern gefunden"}
              </p>
            ) : (
              filteredCredentials.map((credential) => {
                const credentialEinwohner = credential.einwohner;
                const credentialVolksbegehren = credential.volksbegehren;

                return (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleViewCredential(credential)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">
                          {credentialEinwohner
                            ? `${credentialEinwohner.vorname} ${credentialEinwohner.nachname}`
                            : "Unbekannt"}
                        </p>
                        <Badge variant={credential.status?.toLowerCase() === "issued" ? "default" : credential.status?.toLowerCase() === "revoked" ? "destructive" : "secondary"}>
                          {credential.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {credentialVolksbegehren?.title_de || "Unbekannt"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ausgestellt: {new Date(credential.issued_at).toLocaleDateString("de-CH")}{" "}
                        {new Date(credential.issued_at).toLocaleTimeString("de-CH", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateCredentialStatus(credential.id, credential.management_id)}
                          disabled={updatingStatus === credential.id}
                        >
                          <RefreshCw className={`w-4 h-4 ${updatingStatus === credential.id ? 'animate-spin' : ''}`} />
                        </Button>
                        {credential.status !== "revoked" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeCredential(credential)}
                            disabled={loading}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail View Sheet */}
      <Sheet open={!!viewCredential} onOpenChange={(open) => {
        if (!open) {
          setViewCredential(null);
          setCredentialDetails(null);
        }
      }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Stimmrechtsausweis Details</SheetTitle>
            <SheetDescription>Detaillierte Informationen zum Ausweis</SheetDescription>
          </SheetHeader>
          {viewCredential && (() => {
            const credentialEinwohner = einwohner.find((e) => e.id === viewCredential.einwohner_id);
            const credentialVolksbegehren = volksbegehren.find((v) => v.id === viewCredential.volksbegehren_id);
            
            return (
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Einwohner</label>
                    <p className="text-lg font-semibold">
                      {credentialEinwohner 
                        ? `${credentialEinwohner.vorname} ${credentialEinwohner.nachname}` 
                        : "Unbekannt"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Volksbegehren</label>
                    <p className="text-lg">{credentialVolksbegehren?.title_de || "Unbekannt"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="READY">READY</option>
                        <option value="ISSUED">ISSUED</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="REVOKED">REVOKED</option>
                      </select>
                      <Button 
                        size="sm" 
                        onClick={handleUpdateStatus}
                        disabled={loadingDetails || selectedStatus.toLowerCase() === viewCredential.status}
                      >
                        Ändern
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                    <p className="text-sm font-mono break-all">{viewCredential.credential_id || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Management ID</label>
                    <p className="text-sm font-mono break-all">{viewCredential.management_id || "N/A"}</p>
                  </div>
                  {viewCredential.nullifier && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nullifier</label>
                      <p className="text-sm font-mono break-all">{viewCredential.nullifier}</p>
                    </div>
                  )}
                  {viewCredential.issuer_did && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Issuer DID</label>
                      <p className="text-sm font-mono break-all">{viewCredential.issuer_did}</p>
                    </div>
                  )}
                  {viewCredential.issued_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ausstellungsdatum</label>
                      <p className="text-sm">{new Date(viewCredential.issued_date).toLocaleDateString("de-CH")}</p>
                    </div>
                  )}
                  {viewCredential.credential_valid_from && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gültig ab</label>
                      <p className="text-sm">
                        {new Date(viewCredential.credential_valid_from).toLocaleDateString("de-CH")}{" "}
                        {new Date(viewCredential.credential_valid_from).toLocaleTimeString("de-CH", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                  {viewCredential.credential_valid_until && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gültig bis</label>
                      <p className="text-sm">
                        {new Date(viewCredential.credential_valid_until).toLocaleDateString("de-CH")}{" "}
                        {new Date(viewCredential.credential_valid_until).toLocaleTimeString("de-CH", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Offer Deeplink</label>
                    <p className="text-sm font-mono break-all">{viewCredential.offer_deeplink || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issued By</label>
                    <p className="text-sm font-mono break-all">{viewCredential.issued_by || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ausgestellt am</label>
                    <p className="text-lg">
                      {new Date(viewCredential.issued_at).toLocaleDateString("de-CH")}{" "}
                      {new Date(viewCredential.issued_at).toLocaleTimeString("de-CH", { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {viewCredential.revoked_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Widerrufen am</label>
                      <p className="text-lg">
                        {new Date(viewCredential.revoked_at).toLocaleDateString("de-CH")}{" "}
                        {new Date(viewCredential.revoked_at).toLocaleTimeString("de-CH", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                  {viewCredential.revoked_by && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Widerrufen von</label>
                      <p className="text-sm font-mono break-all">{viewCredential.revoked_by}</p>
                    </div>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : credentialDetails && (
                  <>
                    {/* Gültigkeit */}
                    {(credentialDetails.valid_from || credentialDetails.valid_until) && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Gültigkeit</h4>
                        {credentialDetails.valid_from && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Gültig ab</label>
                            <p className="text-sm">
                              {new Date(credentialDetails.valid_from).toLocaleDateString("de-CH")}{" "}
                              {new Date(credentialDetails.valid_from).toLocaleTimeString("de-CH", { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        )}
                        {credentialDetails.valid_until && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Gültig bis</label>
                            <p className="text-sm">
                              {new Date(credentialDetails.valid_until).toLocaleDateString("de-CH")}{" "}
                              {new Date(credentialDetails.valid_until).toLocaleTimeString("de-CH", { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attribute */}
                    {credentialDetails.credential_subject && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Ausgestellte Attribute</h4>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          {Object.entries(credentialDetails.credential_subject).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="font-medium text-muted-foreground">{key}:</span>
                              <span className="font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Signaturen */}
                    {credentialDetails.proofs && credentialDetails.proofs.length > 0 && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Signaturen</h4>
                        {credentialDetails.proofs.map((proof: any, index: number) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-2">
                            {proof.type && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Typ</label>
                                <p className="text-sm font-mono">{proof.type}</p>
                              </div>
                            )}
                            {proof.created && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Erstellt</label>
                                <p className="text-sm">{new Date(proof.created).toLocaleString("de-CH")}</p>
                              </div>
                            )}
                            {proof.verificationMethod && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Verification Method</label>
                                <p className="text-xs font-mono break-all">{proof.verificationMethod}</p>
                              </div>
                            )}
                            {proof.proofPurpose && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Proof Purpose</label>
                                <p className="text-sm font-mono">{proof.proofPurpose}</p>
                              </div>
                            )}
                            {proof.jws && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">JWS Signatur</label>
                                <p className="text-xs font-mono break-all bg-background p-2 rounded mt-1">
                                  {proof.jws}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-4">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground">Stimmrechtsausweis ID</label>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {viewCredential.id}
                    </p>
                  </div>
                  {viewCredential.management_id && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                      <p className="text-xs font-mono text-muted-foreground break-all">
                        {viewCredential.management_id}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUpdateCredentialStatus(viewCredential.id, viewCredential.management_id);
                      if (viewCredential.management_id) {
                        loadCredentialDetails(viewCredential.management_id);
                      }
                    }}
                    disabled={updatingStatus === viewCredential.id}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${updatingStatus === viewCredential.id ? 'animate-spin' : ''}`} />
                    Status prüfen
                  </Button>
                  {viewCredential.status !== "revoked" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleRevokeCredential(viewCredential)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Widerrufen
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* QR Code Dialog after credential issuance */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stimmrechtsausweis importieren</DialogTitle>
            <DialogDescription>
              Scannen Sie den QR-Code mit der swiyu-Wallet App, um den Stimmrechtsausweis zu importieren.
            </DialogDescription>
          </DialogHeader>
          {issuedOfferDeeplink && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <QRCode value={issuedOfferDeeplink} size={256} />
              <p className="text-sm text-muted-foreground text-center">
                QR-Code mit swiyu-Wallet App scannen
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setShowQRDialog(false)}>
              Schliessen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StimmregisterManagement;
