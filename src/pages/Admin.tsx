import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContainer from "@/components/PageContainer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import GemeindenManagement from "@/components/admin/GemeindenManagement";
import EinwohnerManagement from "@/components/admin/EinwohnerManagement";
import StimmregisterManagement from "@/components/admin/StimmregisterManagement";
import VolksbegehrenManagement from "@/components/admin/VolksbegehrenManagement";
import { LogOut } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
      }

      // If no admin role exists, create one (for first-time magic link users)
      if (!roles) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: session.user.id, role: "admin" });

        if (insertError) {
          console.error("Error creating admin role:", insertError);
          toast.error("Sie haben keine Admin-Berechtigung");
          await supabase.auth.signOut();
          navigate("/");
          return;
        } else {
          toast.success("Willkommen! Ihr Admin-Account wurde erstellt.");
        }
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Erfolgreich abgemeldet");
    navigate("/");
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <p>Wird geladen...</p>
        </div>
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Breadcrumb Section */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-8">
            <nav className="text-[16px] leading-[24px] text-[#6b7280]">
              <a href="/" className="hover:text-[#1f2937] underline underline-offset-4">Startseite</a> <span className="inline-block mx-[7px]">›</span> Admin-Bereich
            </nav>
          </PageContainer>
        </section>

        {/* Header Section */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-14 md:py-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="sd-h1">Admin-Bereich</h1>
                <p className="text-[16px] leading-[24px] text-[#6b7280] mt-2">
                  Willkommen, {user?.email}
                </p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </PageContainer>
        </section>

        {/* Tabs Section */}
        <section className="bg-[#f1f4f7] sd-section-py-comfort">
          <PageContainer>
            <Tabs defaultValue="gemeinden" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="gemeinden">Gemeinden</TabsTrigger>
                <TabsTrigger value="einwohner">Einwohner</TabsTrigger>
                <TabsTrigger value="stimmregister">Stimmregister</TabsTrigger>
                <TabsTrigger value="volksbegehren">Volksbegehren</TabsTrigger>
              </TabsList>

              <TabsContent value="gemeinden">
                <GemeindenManagement userId={user?.id} />
              </TabsContent>

              <TabsContent value="einwohner">
                <EinwohnerManagement userId={user?.id} />
              </TabsContent>

              <TabsContent value="stimmregister">
                <StimmregisterManagement userId={user?.id} />
              </TabsContent>

              <TabsContent value="volksbegehren">
                <VolksbegehrenManagement />
              </TabsContent>
            </Tabs>
          </PageContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
