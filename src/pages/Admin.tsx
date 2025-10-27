import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageContainer from "@/components/PageContainer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import GemeindenManagement from "@/components/admin/GemeindenManagement";
import EinwohnerManagement from "@/components/admin/EinwohnerManagement";
import StimmregisterManagement from "@/components/admin/StimmregisterManagement";
import VolksbegehrenManagement from "@/components/admin/VolksbegehrenManagement";
import { LogOut } from "lucide-react";

type AdminSection = "gemeinden" | "einwohner" | "stimmregister" | "volksbegehren";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("gemeinden");

  const menuItems: { label: string; value: AdminSection }[] = [
    { label: "Gemeinden", value: "gemeinden" },
    { label: "Einwohner", value: "einwohner" },
    { label: "Stimmregister", value: "stimmregister" },
    { label: "Volksbegehren", value: "volksbegehren" },
  ];

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

        {/* Header Section with Navigation */}
        <section className="bg-white">
          <PageContainer paddingYClassName="py-14 md:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                <div>
                  <h1 className="sd-h1">Admin-Bereich</h1>
                  <p className="text-[16px] leading-[24px] text-[#6b7280] mt-2">
                    Willkommen, {user?.email}
                  </p>
                </div>
                
                {/* Horizontal Navigation - Desktop */}
                <nav className="hidden lg:flex items-center gap-8 ml-8">
                  {menuItems.map(item => (
                    <button
                      key={item.value}
                      onClick={() => setActiveSection(item.value)}
                      className={`text-[16px] leading-[24px] font-semibold transition-colors ${
                        activeSection === item.value
                          ? "text-[#d8232a]"
                          : "text-[#1f2937] hover:text-[#d8232a]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="self-start lg:self-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="lg:hidden flex flex-wrap gap-4 mt-6 border-t pt-6">
              {menuItems.map(item => (
                <button
                  key={item.value}
                  onClick={() => setActiveSection(item.value)}
                  className={`px-4 py-2 rounded text-[16px] leading-[24px] font-semibold transition-colors ${
                    activeSection === item.value
                      ? "bg-[#d8232a] text-white"
                      : "bg-white border border-[#e0e4e8] text-[#1f2937] hover:bg-[#f1f4f7]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </PageContainer>
        </section>

        {/* Content Section */}
        <section className="bg-[#f1f4f7] sd-section-py-comfort">
          <PageContainer>
            {activeSection === "gemeinden" && <GemeindenManagement userId={user?.id} />}
            {activeSection === "einwohner" && <EinwohnerManagement userId={user?.id} />}
            {activeSection === "stimmregister" && <StimmregisterManagement userId={user?.id} />}
            {activeSection === "volksbegehren" && <VolksbegehrenManagement />}
          </PageContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
