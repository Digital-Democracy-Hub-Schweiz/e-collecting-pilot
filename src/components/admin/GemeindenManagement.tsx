import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { determineCantonFromBfs } from "@/utils/cantonUtils";
import { Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Gemeinde {
  id: string;
  name: string;
  bfs_nummer: string | null;
  kanton: string | null;
}

interface GemeindenManagementProps {
  userId: string;
}

const GemeindenManagement = ({ userId }: GemeindenManagementProps) => {
  const [gemeinden, setGemeinden] = useState<Gemeinde[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGemeinde, setNewGemeinde] = useState({
    name: "",
    bfs_nummer: "",
    kanton: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGemeindeId, setSelectedGemeindeId] = useState<string | null>(null);

  useEffect(() => {
    fetchGemeinden();
  }, [userId]);

  const fetchGemeinden = async () => {
    const { data, error } = await supabase
      .from("gemeinden")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching gemeinden:", error);
      toast.error("Fehler beim Laden der Gemeinden");
    } else {
      setGemeinden(data || []);
    }
  };

  const handleBfsChange = async (bfsValue: string) => {
    setNewGemeinde({ ...newGemeinde, bfs_nummer: bfsValue, kanton: "" });
    
    if (bfsValue && !isNaN(Number(bfsValue))) {
      const kanton = await determineCantonFromBfs(Number(bfsValue));
      setNewGemeinde(prev => ({ ...prev, kanton }));
    }
  };

  const handleCreateGemeinde = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGemeinde.bfs_nummer) {
      toast.error("BFS-Nummer ist erforderlich");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("gemeinden").insert({
        name: newGemeinde.name,
        bfs_nummer: newGemeinde.bfs_nummer,
        kanton: newGemeinde.kanton || null,
        created_by: userId,
      });

      if (error) throw error;

      toast.success("Gemeinde erfolgreich erstellt");
      setNewGemeinde({ name: "", bfs_nummer: "", kanton: "" });
      fetchGemeinden();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen der Gemeinde");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGemeinde = async (id: string) => {
    if (!confirm("Möchten Sie diese Gemeinde wirklich löschen?")) return;

    const { error } = await supabase.from("gemeinden").delete().eq("id", id);

    if (error) {
      console.error("Fehler beim Löschen der Gemeinde:", error);
      toast.error(`Fehler beim Löschen der Gemeinde: ${error.message || ''}`);
    } else {
      toast.success("Gemeinde erfolgreich gelöscht");
      fetchGemeinden();
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGemeindeId) return;

    setLoading(true);

    try {
      // Check if user exists
      const { data: users, error: userError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (userError) throw userError;

      // For now, we'll just show a message that the admin needs to sign up first
      toast.info(
        "Der eingeladene Admin muss sich zuerst registrieren. Teilen Sie ihm die E-Mail-Adresse mit."
      );
      setInviteEmail("");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Einladen des Admins");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Neue Gemeinde erstellen</CardTitle>
          <CardDescription>
            Erstellen Sie eine neue Gemeinde und werden Sie automatisch als Admin hinzugefügt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGemeinde} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gemeindename *</Label>
                <Input
                  id="name"
                  value={newGemeinde.name}
                  onChange={(e) =>
                    setNewGemeinde({ ...newGemeinde, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bfs">BFS-Nummer *</Label>
                <Input
                  id="bfs"
                  value={newGemeinde.bfs_nummer}
                  onChange={(e) => handleBfsChange(e.target.value)}
                  required
                  placeholder="z.B. 261"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kanton">Kanton (automatisch ermittelt)</Label>
                <Input
                  id="kanton"
                  value={newGemeinde.kanton}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Wird erstellt..." : "Gemeinde erstellen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Gemeinden</CardTitle>
          <CardDescription>Verwalten Sie Ihre Gemeinden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gemeinden.length === 0 ? (
              <p className="text-muted-foreground">Keine Gemeinden vorhanden</p>
            ) : (
              gemeinden.map((gemeinde) => (
                <div
                  key={gemeinde.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{gemeinde.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {gemeinde.bfs_nummer && `BFS: ${gemeinde.bfs_nummer}`}
                      {gemeinde.kanton && ` | Kanton: ${gemeinde.kanton}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGemeindeId(gemeinde.id)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Admin einladen
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Admin einladen</DialogTitle>
                          <DialogDescription>
                            Laden Sie einen weiteren Admin für {gemeinde.name} ein
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInviteAdmin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={loading}>
                            Einladung senden
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGemeinde(gemeinde.id)}
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

export default GemeindenManagement;
