import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import ImportVolksbegehren from "./ImportVolksbegehren";

interface Volksbegehren {
  id: string;
  slug: string;
  title_de: string;
  title_fr: string | null;
  title_it: string | null;
  title_rm: string | null;
  title_en: string | null;
  description_de: string | null;
  type: string;
  level: string;
  comitee: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

const VolksbegehrenManagement = () => {
  const [volksbegehren, setVolksbegehren] = useState<Volksbegehren[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVolksbegehren, setNewVolksbegehren] = useState({
    slug: "",
    title_de: "",
    title_fr: "",
    title_it: "",
    description_de: "",
    type: "referendum",
    level: "federal",
    comitee: "",
    start_date: "",
    end_date: "",
  });
  const [editVolksbegehren, setEditVolksbegehren] = useState<Volksbegehren | null>(null);
  const [viewVolksbegehren, setViewVolksbegehren] = useState<Volksbegehren | null>(null);

  useEffect(() => {
    fetchVolksbegehren();
  }, []);

  const fetchVolksbegehren = async () => {
    const { data, error } = await supabase
      .from("volksbegehren")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching volksbegehren:", error);
      toast.error("Fehler beim Laden der Volksbegehren");
    } else {
      setVolksbegehren(data || []);
    }
  };

  const handleCreateVolksbegehren = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("volksbegehren").insert({
        slug: newVolksbegehren.slug,
        title_de: newVolksbegehren.title_de,
        title_fr: newVolksbegehren.title_fr || null,
        title_it: newVolksbegehren.title_it || null,
        description_de: newVolksbegehren.description_de || null,
        type: newVolksbegehren.type,
        level: newVolksbegehren.level,
        comitee: newVolksbegehren.comitee || null,
        start_date: newVolksbegehren.start_date || null,
        end_date: newVolksbegehren.end_date || null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Volksbegehren erfolgreich erstellt");
      setNewVolksbegehren({
        slug: "",
        title_de: "",
        title_fr: "",
        title_it: "",
        description_de: "",
        type: "referendum",
        level: "federal",
        comitee: "",
        start_date: "",
        end_date: "",
      });
      setDialogOpen(false);
      fetchVolksbegehren();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen des Volksbegehrens");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVolksbegehren = async (id: string) => {
    if (!confirm("Möchten Sie dieses Volksbegehren wirklich löschen?")) return;

    const { error } = await supabase.from("volksbegehren").delete().eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen des Volksbegehrens");
    } else {
      toast.success("Volksbegehren erfolgreich gelöscht");
      fetchVolksbegehren();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("volksbegehren")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Aktualisieren des Status");
    } else {
      toast.success("Status erfolgreich aktualisiert");
      fetchVolksbegehren();
    }
  };

  const handleUpdateVolksbegehren = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVolksbegehren) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("volksbegehren")
        .update({
          slug: editVolksbegehren.slug,
          title_de: editVolksbegehren.title_de,
          title_fr: editVolksbegehren.title_fr,
          title_it: editVolksbegehren.title_it,
          description_de: editVolksbegehren.description_de,
          type: editVolksbegehren.type,
          level: editVolksbegehren.level,
          comitee: editVolksbegehren.comitee,
          start_date: editVolksbegehren.start_date,
          end_date: editVolksbegehren.end_date,
        })
        .eq("id", editVolksbegehren.id);

      if (error) throw error;

      toast.success("Volksbegehren erfolgreich aktualisiert");
      setEditVolksbegehren(null);
      fetchVolksbegehren();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Aktualisieren des Volksbegehrens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Volksbegehren</CardTitle>
              <CardDescription>{volksbegehren.length} Volksbegehren</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Volksbegehren hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neues Volksbegehren erstellen</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie ein neues Volksbegehren oder Referendum
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateVolksbegehren} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL-Name) *</Label>
                      <Input
                        id="slug"
                        value={newVolksbegehren.slug}
                        onChange={(e) =>
                          setNewVolksbegehren({ ...newVolksbegehren, slug: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Typ *</Label>
                      <Select
                        value={newVolksbegehren.type}
                        onValueChange={(value) =>
                          setNewVolksbegehren({ ...newVolksbegehren, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="referendum">Referendum</SelectItem>
                          <SelectItem value="initiative">Initiative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Ebene *</Label>
                      <Select
                        value={newVolksbegehren.level}
                        onValueChange={(value) =>
                          setNewVolksbegehren({ ...newVolksbegehren, level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="federal">Bundesebene</SelectItem>
                          <SelectItem value="cantonal">Kantonal</SelectItem>
                          <SelectItem value="municipal">Gemeinde</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Startdatum</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newVolksbegehren.start_date}
                        onChange={(e) =>
                          setNewVolksbegehren({ ...newVolksbegehren, start_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Enddatum</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newVolksbegehren.end_date}
                        onChange={(e) =>
                          setNewVolksbegehren({ ...newVolksbegehren, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_de">Titel (Deutsch) *</Label>
                    <Input
                      id="title_de"
                      value={newVolksbegehren.title_de}
                      onChange={(e) =>
                        setNewVolksbegehren({ ...newVolksbegehren, title_de: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title_fr">Titel (Französisch)</Label>
                      <Input
                        id="title_fr"
                        value={newVolksbegehren.title_fr}
                        onChange={(e) =>
                          setNewVolksbegehren({ ...newVolksbegehren, title_fr: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_it">Titel (Italienisch)</Label>
                      <Input
                        id="title_it"
                        value={newVolksbegehren.title_it}
                        onChange={(e) =>
                          setNewVolksbegehren({ ...newVolksbegehren, title_it: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_de">Beschreibung (Deutsch)</Label>
                    <Textarea
                      id="description_de"
                      value={newVolksbegehren.description_de}
                      onChange={(e) =>
                        setNewVolksbegehren({
                          ...newVolksbegehren,
                          description_de: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comitee">Komitee</Label>
                    <Input
                      id="comitee"
                      value={newVolksbegehren.comitee}
                      onChange={(e) =>
                        setNewVolksbegehren({ ...newVolksbegehren, comitee: e.target.value })
                      }
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Wird erstellt..." : "Volksbegehren erstellen"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {volksbegehren.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keine Volksbegehren vorhanden</p>
            ) : (
              volksbegehren.map((vb) => (
                <Card 
                  key={vb.id} 
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setViewVolksbegehren(vb)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{vb.title_de}</h3>
                          <Badge variant={vb.status === "active" ? "default" : "secondary"}>
                            {vb.status === "active" ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-sm text-muted-foreground mb-2">
                          <span className="capitalize">{vb.type === "referendum" ? "Referendum" : "Initiative"}</span>
                          <span>•</span>
                          <span>
                            {vb.level === "federal" ? "Bundesebene" : 
                             vb.level === "cantonal" ? "Kantonal" : "Gemeinde"}
                          </span>
                        </div>
                        {vb.description_de && (
                          <p className="text-sm mt-2 line-clamp-2">{vb.description_de}</p>
                        )}
                        {vb.comitee && (
                          <p className="text-xs text-muted-foreground mt-2">Komitee: {vb.comitee}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditVolksbegehren(vb)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(vb.id, vb.status)}
                        >
                          {vb.status === "active" ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVolksbegehren(vb.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ImportVolksbegehren />

      {/* Detail View Sheet */}
      <Sheet open={!!viewVolksbegehren} onOpenChange={(open) => !open && setViewVolksbegehren(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Volksbegehren Details</SheetTitle>
            <SheetDescription>Detaillierte Informationen zum Volksbegehren</SheetDescription>
          </SheetHeader>
          {viewVolksbegehren && (
            <div className="mt-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Titel (Deutsch)</Label>
                <p className="text-lg font-semibold">{viewVolksbegehren.title_de}</p>
              </div>
              {viewVolksbegehren.title_fr && (
                <div>
                  <Label className="text-muted-foreground">Titel (Französisch)</Label>
                  <p className="text-lg">{viewVolksbegehren.title_fr}</p>
                </div>
              )}
              {viewVolksbegehren.title_it && (
                <div>
                  <Label className="text-muted-foreground">Titel (Italienisch)</Label>
                  <p className="text-lg">{viewVolksbegehren.title_it}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Typ</Label>
                <p className="text-lg capitalize">{viewVolksbegehren.type === "referendum" ? "Referendum" : "Initiative"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ebene</Label>
                <p className="text-lg">
                  {viewVolksbegehren.level === "federal" ? "Bundesebene" : 
                   viewVolksbegehren.level === "cantonal" ? "Kantonal" : "Gemeinde"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={viewVolksbegehren.status === "active" ? "default" : "secondary"}>
                    {viewVolksbegehren.status === "active" ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </div>
              {viewVolksbegehren.start_date && (
                <div>
                  <Label className="text-muted-foreground">Startdatum</Label>
                  <p className="text-lg">{viewVolksbegehren.start_date}</p>
                </div>
              )}
              {viewVolksbegehren.end_date && (
                <div>
                  <Label className="text-muted-foreground">Enddatum</Label>
                  <p className="text-lg">{viewVolksbegehren.end_date}</p>
                </div>
              )}
              {viewVolksbegehren.comitee && (
                <div>
                  <Label className="text-muted-foreground">Komitee</Label>
                  <p className="text-lg">{viewVolksbegehren.comitee}</p>
                </div>
              )}
              {viewVolksbegehren.description_de && (
                <div>
                  <Label className="text-muted-foreground">Beschreibung</Label>
                  <p className="text-sm mt-1">{viewVolksbegehren.description_de}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Slug</Label>
                <p className="text-sm font-mono text-muted-foreground">{viewVolksbegehren.slug}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={!!editVolksbegehren} onOpenChange={(open) => !open && setEditVolksbegehren(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volksbegehren bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Volksbegehren-Informationen</DialogDescription>
          </DialogHeader>
          {editVolksbegehren && (
            <form onSubmit={handleUpdateVolksbegehren} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug (URL-Name) *</Label>
                  <Input
                    id="edit-slug"
                    value={editVolksbegehren.slug}
                    onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, slug: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Typ *</Label>
                  <Select
                    value={editVolksbegehren.type}
                    onValueChange={(value) => setEditVolksbegehren({ ...editVolksbegehren, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referendum">Referendum</SelectItem>
                      <SelectItem value="initiative">Initiative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Ebene *</Label>
                  <Select
                    value={editVolksbegehren.level}
                    onValueChange={(value) => setEditVolksbegehren({ ...editVolksbegehren, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="federal">Bundesebene</SelectItem>
                      <SelectItem value="cantonal">Kantonal</SelectItem>
                      <SelectItem value="municipal">Gemeinde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title-de">Titel (Deutsch) *</Label>
                <Input
                  id="edit-title-de"
                  value={editVolksbegehren.title_de}
                  onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, title_de: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title-fr">Titel (Französisch)</Label>
                  <Input
                    id="edit-title-fr"
                    value={editVolksbegehren.title_fr || ""}
                    onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, title_fr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-title-it">Titel (Italienisch)</Label>
                  <Input
                    id="edit-title-it"
                    value={editVolksbegehren.title_it || ""}
                    onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, title_it: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description-de">Beschreibung (Deutsch)</Label>
                <Textarea
                  id="edit-description-de"
                  value={editVolksbegehren.description_de || ""}
                  onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, description_de: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-comitee">Komitee</Label>
                <Input
                  id="edit-comitee"
                  value={editVolksbegehren.comitee || ""}
                  onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, comitee: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Startdatum</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editVolksbegehren.start_date || ""}
                    onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">Enddatum</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editVolksbegehren.end_date || ""}
                    onChange={(e) => setEditVolksbegehren({ ...editVolksbegehren, end_date: e.target.value })}
                  />
                </div>
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

export default VolksbegehrenManagement;
