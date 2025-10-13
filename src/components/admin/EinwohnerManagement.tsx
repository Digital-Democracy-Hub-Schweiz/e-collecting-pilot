import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";

interface Gemeinde {
  id: string;
  name: string;
}

interface Einwohner {
  id: string;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  gemeinde_id: string;
}

interface EinwohnerManagementProps {
  userId: string;
}

const EinwohnerManagement = ({ userId }: EinwohnerManagementProps) => {
  const [gemeinden, setGemeinden] = useState<Gemeinde[]>([]);
  const [einwohner, setEinwohner] = useState<Einwohner[]>([]);
  const [selectedGemeindeId, setSelectedGemeindeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [newEinwohner, setNewEinwohner] = useState({
    vorname: "",
    nachname: "",
    geburtsdatum: "",
  });
  const [editEinwohner, setEditEinwohner] = useState<Einwohner | null>(null);
  const [viewEinwohner, setViewEinwohner] = useState<Einwohner | null>(null);

  useEffect(() => {
    fetchGemeinden();
  }, [userId]);

  useEffect(() => {
    if (selectedGemeindeId) {
      fetchEinwohner();
    }
  }, [selectedGemeindeId]);

  const fetchGemeinden = async () => {
    const { data, error } = await supabase
      .from("gemeinden")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching gemeinden:", error);
      toast.error("Fehler beim Laden der Gemeinden");
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
      .select("*")
      .eq("gemeinde_id", selectedGemeindeId)
      .order("nachname");

    if (error) {
      console.error("Error fetching einwohner:", error);
      toast.error("Fehler beim Laden der Einwohner");
    } else {
      setEinwohner(data || []);
    }
  };

  const handleCreateEinwohner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGemeindeId) {
      toast.error("Bitte wählen Sie eine Gemeinde aus");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("einwohner").insert({
        gemeinde_id: selectedGemeindeId,
        vorname: newEinwohner.vorname,
        nachname: newEinwohner.nachname,
        geburtsdatum: newEinwohner.geburtsdatum,
      });

      if (error) throw error;

      toast.success("Einwohner erfolgreich erstellt");
      setNewEinwohner({ vorname: "", nachname: "", geburtsdatum: "" });
      fetchEinwohner();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen des Einwohners");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEinwohner = async (id: string) => {
    if (!confirm("Möchten Sie diesen Einwohner wirklich löschen?")) return;

    const { error } = await supabase.from("einwohner").delete().eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen des Einwohners");
    } else {
      toast.success("Einwohner erfolgreich gelöscht");
      fetchEinwohner();
    }
  };

  const handleUpdateEinwohner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEinwohner) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("einwohner")
        .update({
          vorname: editEinwohner.vorname,
          nachname: editEinwohner.nachname,
          geburtsdatum: editEinwohner.geburtsdatum,
        })
        .eq("id", editEinwohner.id);

      if (error) throw error;

      toast.success("Einwohner erfolgreich aktualisiert");
      setEditEinwohner(null);
      fetchEinwohner();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Aktualisieren des Einwohners");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Einwohner verwalten</CardTitle>
          <CardDescription>
            Erfassen und verwalten Sie Einwohner für Ihre Gemeinden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gemeinde auswählen</Label>
            <Select value={selectedGemeindeId} onValueChange={setSelectedGemeindeId}>
              <SelectTrigger>
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
            <form onSubmit={handleCreateEinwohner} className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Neuer Einwohner</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vorname">Vorname *</Label>
                  <Input
                    id="vorname"
                    value={newEinwohner.vorname}
                    onChange={(e) =>
                      setNewEinwohner({ ...newEinwohner, vorname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nachname">Nachname *</Label>
                  <Input
                    id="nachname"
                    value={newEinwohner.nachname}
                    onChange={(e) =>
                      setNewEinwohner({ ...newEinwohner, nachname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
                  <Input
                    id="geburtsdatum"
                    type="date"
                    value={newEinwohner.geburtsdatum}
                    onChange={(e) =>
                      setNewEinwohner({ ...newEinwohner, geburtsdatum: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Wird erstellt..." : "Einwohner erstellen"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {selectedGemeindeId && (
        <Card>
          <CardHeader>
            <CardTitle>Einwohnerliste</CardTitle>
            <CardDescription>
              {einwohner.length} Einwohner in der ausgewählten Gemeinde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {einwohner.length === 0 ? (
                <p className="text-muted-foreground">Keine Einwohner vorhanden</p>
              ) : (
              einwohner.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setViewEinwohner(person)}
                  >
                    <div>
                      <p className="font-semibold">
                        {person.vorname} {person.nachname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Geb.: {new Date(person.geburtsdatum).toLocaleDateString("de-CH")}
                      </p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditEinwohner(person)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEinwohner(person.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail View Sheet */}
      <Sheet open={!!viewEinwohner} onOpenChange={(open) => !open && setViewEinwohner(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Einwohner Details</SheetTitle>
            <SheetDescription>Detaillierte Informationen zum Einwohner</SheetDescription>
          </SheetHeader>
          {viewEinwohner && (
            <div className="mt-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Vorname</Label>
                <p className="text-lg font-semibold">{viewEinwohner.vorname}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Nachname</Label>
                <p className="text-lg font-semibold">{viewEinwohner.nachname}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Geburtsdatum</Label>
                <p className="text-lg">{new Date(viewEinwohner.geburtsdatum).toLocaleDateString("de-CH")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ID</Label>
                <p className="text-sm font-mono text-muted-foreground">{viewEinwohner.id}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={!!editEinwohner} onOpenChange={(open) => !open && setEditEinwohner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Einwohner bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Einwohner-Informationen</DialogDescription>
          </DialogHeader>
          {editEinwohner && (
            <form onSubmit={handleUpdateEinwohner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vorname">Vorname *</Label>
                <Input
                  id="edit-vorname"
                  value={editEinwohner.vorname}
                  onChange={(e) => setEditEinwohner({ ...editEinwohner, vorname: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nachname">Nachname *</Label>
                <Input
                  id="edit-nachname"
                  value={editEinwohner.nachname}
                  onChange={(e) => setEditEinwohner({ ...editEinwohner, nachname: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-geburtsdatum">Geburtsdatum *</Label>
                <Input
                  id="edit-geburtsdatum"
                  type="date"
                  value={editEinwohner.geburtsdatum}
                  onChange={(e) => setEditEinwohner({ ...editEinwohner, geburtsdatum: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Wird aktualisiert..." : "Änderungen speichern"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EinwohnerManagement;
