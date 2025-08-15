import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Share2, Receipt, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VerificationResponse } from "@/services/verificationAPI";

interface VerificationSummaryProps {
  verification: VerificationResponse;
  onCreateReceipt?: () => void;
}

export function VerificationSummary({ verification, onCreateReceipt }: VerificationSummaryProps) {
  const { toast } = useToast();

  const credentialData = verification.wallet_response?.credential_subject_data;
  
  if (!credentialData) {
    return null;
  }

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link kopiert",
        description: "Der Verifizierungs-Link wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleCopyData = async () => {
    const dataText = `Name: ${credentialData.given_name || ''} ${credentialData.family_name || ''}
Geburtsdatum: ${credentialData.birth_date || 'Nicht verfügbar'}
Verifikations-ID: ${verification.id}`;
    
    try {
      await navigator.clipboard.writeText(dataText);
      toast({
        title: "Daten kopiert",
        description: "Die verifizierten Daten wurden in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Daten konnten nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Verifizierung erfolgreich</CardTitle>
          <CardDescription className="text-green-700">
            Die Identitätsdaten wurden erfolgreich verifiziert und freigegeben.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Verified Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verifizierte Daten
          </CardTitle>
          <CardDescription>
            Die folgenden Daten wurden von der Beta-ID freigegeben
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Vorname:</span>
              <span className="text-muted-foreground">{credentialData.given_name || 'Nicht verfügbar'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Nachname:</span>
              <span className="text-muted-foreground">{credentialData.family_name || 'Nicht verfügbar'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Geburtsdatum:</span>
              <span className="text-muted-foreground">{credentialData.birth_date || 'Nicht verfügbar'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Credential Type:</span>
              <Badge variant="secondary">{credentialData.vct}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Weitere Aktionen</CardTitle>
          <CardDescription>
            Teilen Sie die Verifizierung oder erstellen Sie eine Quittung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Verifizierung teilen
            </Button>
            <Button onClick={handleCopyData} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Daten kopieren
            </Button>
            {onCreateReceipt && (
              <Button onClick={onCreateReceipt} className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Quittung erstellen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technische Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Verifizierungs-ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{verification.id}</code>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant="default">SUCCESS</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Issuer:</span>
              <span className="text-xs text-muted-foreground break-all">
                {credentialData.iss?.substring(0, 60)}...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}