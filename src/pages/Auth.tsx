import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import PageContainer from "@/components/PageContainer";

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
          emailRedirectTo: "https://beta.ecollecting.ch/admin",
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
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Breadcrumb Section */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href="/" className="hover:text-[#1f2937] underline underline-offset-4">Startseite</a> <span className="inline-block mx-[7px]">›</span> Admin Login
            </nav>
          </PageContainer>
        </section>

        {/* Login Section */}
        <section className="bg-[#f1f4f7] sd-section-py-comfort">
          <PageContainer>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md bg-white">
                <CardHeader className="text-center">
                  <CardDescription>
                    {emailSent
                      ? "Prüfen Sie Ihr E-Mail-Postfach"
                      : ""}
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
          </PageContainer>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
