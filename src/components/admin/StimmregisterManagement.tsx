import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { issuerBusinessAPI } from "@/services/issuerAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ban, Plus, RefreshCw } from "lucide-react";

interface Gemeinde {
  id: string;
  name: string;
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
}

interface Credential {
  id: string;
  einwohner_id: string;
  volksbegehren_id: string;
  status: string;
  offer_deeplink: string | null;
  management_id: string | null;
  issued_at: string;
  revoked_at: string | null;
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
      .select("id, name")
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
      .select("id, title_de, slug")
      .eq("status", "active")
      .order("title_de");

    if (error) {
      console.error("Error fetching volksbegehren:", error);
    } else {
      setVolksbegehren(data || []);
    }
  };

  const fetchCredentials = async () => {
    if (!selectedGemeindeId) return;

    const { data: einwohnerData } = await supabase
      .from("einwohner")
      .select("id")
      .eq("gemeinde_id", selectedGemeindeId);

    if (!einwohnerData) return;

    const einwohnerIds = einwohnerData.map((e) => e.id);

    const { data, error } = await supabase
      .from("credentials")
      .select(`
        *,
        einwohner:einwohner_id (
          vorname,
          nachname,
          geburtsdatum
        ),
        volksbegehren:volksbegehren_id (
          title_de,
          slug
        )
      `)
      .in("einwohner_id", einwohnerIds)
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
      const selectedEinwohner = einwohner.find((e) => e.id === selectedEinwohnerId);
      const selectedVolksbegehren = volksbegehren.find((v) => v.id === selectedVolksbegehrenId);

      if (!selectedEinwohner || !selectedVolksbegehren) {
        throw new Error("Einwohner oder Volksbegehren nicht gefunden");
      }

      // Issue credential via API
      const response = await issuerBusinessAPI.issueCredential({
        metadata_credential_supported_id: ["stimmrechtsausweis"],
        credential_subject_data: {
          firstName: selectedEinwohner.vorname,
          lastName: selectedEinwohner.nachname,
          birthDate: selectedEinwohner.geburtsdatum,
          title: selectedVolksbegehren.title_de,
          type: "Stimmrechtsausweis",
        },
      });

      // Save to database
      const { error } = await supabase.from("credentials").insert({
        einwohner_id: selectedEinwohnerId,
        volksbegehren_id: selectedVolksbegehrenId,
        management_id: response.management_id,
        offer_deeplink: response.offer_deeplink,
        credential_id: response.id,
        status: "issued",
        issued_by: userId,
      });

      if (error) throw error;

      toast.success("Stimmrechtsausweis erfolgreich ausgestellt");
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

  const handleRevokeCredential = async (credentialId: string, managementId: string | null) => {
    if (!confirm("Möchten Sie diesen Ausweis wirklich widerrufen?")) return;

    setLoading(true);

    try {
      // Call revoke API
      if (managementId) {
        await fetch(`https://issuer-gemeinde.ecollecting.ch/management/api/credentials/${managementId}/revoke`, {
          method: 'POST',
          headers: {
            'Accept': '*/*',
          },
        });
      }

      // Update database
      const { error } = await supabase
        .from("credentials")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: userId,
        })
        .eq("id", credentialId);

      if (error) throw error;

      toast.success("Ausweis erfolgreich widerrufen");
      fetchCredentials();
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
      const statusResponse = await issuerBusinessAPI.checkCredentialStatus(managementId);
      
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Gemeinde</label>
              </div>
              <Select value={selectedGemeindeId} onValueChange={setSelectedGemeindeId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Wählen Sie eine Gemeinde" />
                </SelectTrigger>
                <SelectContent>
                  {gemeinden.map((gemeinde) => (
                    <SelectItem key={gemeinde.id} value={gemeinde.id}>
                      {gemeinde.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                        <SelectContent>
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
                        <SelectContent>
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
        </CardHeader>
        
        {selectedGemeindeId && (
          <CardContent>
            <div className="space-y-2">
              {credentials.length === 0 ? (
                <p className="text-muted-foreground">Keine Ausweise vorhanden</p>
              ) : (
                credentials.map((credential) => {
                  const credentialEinwohner = einwohner.find((e) => e.id === credential.einwohner_id);
                  const credentialVolksbegehren = volksbegehren.find(
                    (v) => v.id === credential.volksbegehren_id
                  );

                  return (
                    <div
                      key={credential.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setViewCredential(credential)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {credentialEinwohner
                              ? `${credentialEinwohner.vorname} ${credentialEinwohner.nachname}`
                              : "Unbekannt"}
                          </p>
                          <Badge variant={credential.status === "issued" ? "default" : credential.status === "revoked" ? "destructive" : "secondary"}>
                            {credential.status}
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
                        {credential.status === "issued" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRevokeCredential(credential.id, credential.management_id)
                            }
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
        )}
      </Card>

      {/* Detail View Sheet */}
      <Sheet open={!!viewCredential} onOpenChange={(open) => !open && setViewCredential(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Stimmrechtsausweis Details</SheetTitle>
            <SheetDescription>Detaillierte Informationen zum Ausweis</SheetDescription>
          </SheetHeader>
          {viewCredential && (() => {
            const credentialEinwohner = einwohner.find((e) => e.id === viewCredential.einwohner_id);
            const credentialVolksbegehren = volksbegehren.find((v) => v.id === viewCredential.volksbegehren_id);
            
            return (
              <div className="mt-6 space-y-4">
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
                  <div className="mt-1">
                    <Badge variant={viewCredential.status === "issued" ? "default" : viewCredential.status === "revoked" ? "destructive" : "secondary"}>
                      {viewCredential.status}
                    </Badge>
                  </div>
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
                {viewCredential.management_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Management ID</label>
                    <p className="text-sm font-mono text-muted-foreground break-all">
                      {viewCredential.management_id}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {viewCredential.id}
                  </p>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateCredentialStatus(viewCredential.id, viewCredential.management_id)}
                    disabled={updatingStatus === viewCredential.id}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${updatingStatus === viewCredential.id ? 'animate-spin' : ''}`} />
                    Status aktualisieren
                  </Button>
                  {viewCredential.status === "issued" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleRevokeCredential(viewCredential.id, viewCredential.management_id);
                        setViewCredential(null);
                      }}
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
    </div>
  );
};

export default StimmregisterManagement;
