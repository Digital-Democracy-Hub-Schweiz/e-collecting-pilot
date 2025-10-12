import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import volksbegehrenDE from "@/data/volksbegehren/de.json";
import volksbegehrenFR from "@/data/volksbegehren/fr.json";
import volksbegehrenIT from "@/data/volksbegehren/it.json";
import volksbegehrenRM from "@/data/volksbegehren/rm.json";
import volksbegehrenEN from "@/data/volksbegehren/en.json";

const ImportVolksbegehren = () => {
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    try {
      // Merge all language data
      const mergedData = volksbegehrenDE.filter((vb) => vb.show).map((vbDE) => {
        const vbFR = volksbegehrenFR.find((v) => v.id === vbDE.id);
        const vbIT = volksbegehrenIT.find((v) => v.id === vbDE.id);
        const vbRM = volksbegehrenRM.find((v) => v.id === vbDE.id);
        const vbEN = volksbegehrenEN.find((v) => v.id === vbDE.id);

        return {
          slug: vbDE.slug,
          title_de: vbDE.title,
          title_fr: vbFR?.title || null,
          title_it: vbIT?.title || null,
          title_rm: vbRM?.title || null,
          title_en: vbEN?.title || null,
          description_de: vbDE.wording || null,
          description_fr: vbFR?.wording || null,
          description_it: vbIT?.wording || null,
          description_rm: vbRM?.wording || null,
          description_en: vbEN?.wording || null,
          type: vbDE.type,
          level: vbDE.level === "Bund" ? "federal" : "cantonal",
          comitee: vbDE.comitee || null,
          sign_date: vbDE.start_date || null,
          status: "active",
        };
      });

      // Check which already exist
      const { data: existing } = await supabase
        .from("volksbegehren")
        .select("slug");

      const existingSlugs = new Set((existing || []).map((e) => e.slug));
      const newImports = mergedData.filter((imp) => !existingSlugs.has(imp.slug));

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
