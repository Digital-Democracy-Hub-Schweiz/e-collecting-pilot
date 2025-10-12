import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Magic Link wurde an Ihre E-Mail gesendet!");
    } catch (error: any) {
      toast.error(error.message || "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            {emailSent
              ? "Prüfen Sie Ihr E-Mail-Postfach"
              : "Wir senden Ihnen einen Login-Link per E-Mail"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird gesendet..." : "Magic Link senden"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Ein Login-Link wurde an <strong>{email}</strong> gesendet.
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Klicken Sie auf den Link in der E-Mail, um sich anzumelden.</p>
                <p className="text-xs">Der Link ist 60 Minuten gültig.</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Andere E-Mail verwenden
              </Button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Beim ersten Login wird automatisch ein Admin-Account erstellt.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
