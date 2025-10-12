import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import volksbegehrenDE from "@/data/volksbegehren/de.json";

const ImportVolksbegehren = () => {
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    try {
      // Import all volksbegehren from JSON
      const imports = volksbegehrenDE
        .filter((vb) => vb.show)
        .map((vb) => ({
          slug: vb.slug,
          title_de: vb.title,
          type: vb.type,
          level: vb.level === "Bund" ? "federal" : "cantonal",
          comitee: vb.comitee || null,
          sign_date: vb.start_date || null,
          description_de: vb.wording || null,
          status: "active",
        }));

      // Check which already exist
      const { data: existing } = await supabase
        .from("volksbegehren")
        .select("slug");

      const existingSlugs = new Set((existing || []).map((e) => e.slug));
      const newImports = imports.filter((imp) => !existingSlugs.has(imp.slug));

      if (newImports.length === 0) {
        toast.info("Alle Volksbegehren sind bereits importiert");
        setImported(true);
        return;
      }

      const { error } = await supabase.from("volksbegehren").insert(newImports);

      if (error) throw error;

      toast.success(`${newImports.length} Volksbegehren erfolgreich importiert`);
      setImported(true);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Fehler beim Importieren");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volksbegehren importieren</CardTitle>
        <CardDescription>
          Importiere die Volksbegehren aus den JSON-Dateien in die Datenbank
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!imported ? (
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Importiere..." : "Jetzt importieren"}
          </Button>
        ) : (
          <div className="text-sm text-green-600 dark:text-green-400">
            ✓ Import abgeschlossen
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportVolksbegehren;
