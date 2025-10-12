import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";
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
  sign_date: string | null;
  status: string;
}

const VolksbegehrenManagement = () => {
  const [volksbegehren, setVolksbegehren] = useState<Volksbegehren[]>([]);
  const [loading, setLoading] = useState(false);
  const [newVolksbegehren, setNewVolksbegehren] = useState({
    slug: "",
    title_de: "",
    title_fr: "",
    title_it: "",
    description_de: "",
    type: "referendum",
    level: "federal",
    comitee: "",
    sign_date: "",
  });

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
        sign_date: newVolksbegehren.sign_date || null,
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
        sign_date: "",
      });
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

  return (
    <div className="space-y-6">
      <ImportVolksbegehren />
      
      <Card>
        <CardHeader>
          <CardTitle>Neues Volksbegehren erstellen</CardTitle>
          <CardDescription>
            Erstellen Sie ein neues Volksbegehren oder Referendum
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="space-y-2">
                <Label htmlFor="sign_date">Unterschriftsdatum</Label>
                <Input
                  id="sign_date"
                  type="date"
                  value={newVolksbegehren.sign_date}
                  onChange={(e) =>
                    setNewVolksbegehren({ ...newVolksbegehren, sign_date: e.target.value })
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

            <Button type="submit" disabled={loading}>
              {loading ? "Wird erstellt..." : "Volksbegehren erstellen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volksbegehren-Liste</CardTitle>
          <CardDescription>{volksbegehren.length} Volksbegehren</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {volksbegehren.length === 0 ? (
              <p className="text-muted-foreground">Keine Volksbegehren vorhanden</p>
            ) : (
              volksbegehren.map((vb) => (
                <div
                  key={vb.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{vb.title_de}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vb.type} | {vb.level} | Status: {vb.status}
                    </p>
                    {vb.description_de && (
                      <p className="text-sm mt-2 line-clamp-2">{vb.description_de}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolksbegehrenManagement;
