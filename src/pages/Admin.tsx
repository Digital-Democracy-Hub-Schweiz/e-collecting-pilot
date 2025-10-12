import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContainer from "@/components/PageContainer";
import GemeindenManagement from "@/components/admin/GemeindenManagement";
import EinwohnerManagement from "@/components/admin/EinwohnerManagement";
import StimmregisterManagement from "@/components/admin/StimmregisterManagement";
import VolksbegehrenManagement from "@/components/admin/VolksbegehrenManagement";

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
    <PageContainer>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Admin-Bereich</h1>
            <p className="text-muted-foreground mt-2">
              Willkommen, {user?.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Abmelden
          </Button>
        </div>

        <Tabs defaultValue="gemeinden" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
      </div>
    </PageContainer>
  );
};

export default Admin;
