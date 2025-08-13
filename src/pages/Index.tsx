import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Template</div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Your Clean Template
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A beautiful, minimal starting point for your next project. Built with modern design principles 
            and ready to be customized to your needs.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-primary border-0">
              Primary Action
            </Button>
            <Button variant="outline" size="lg">
              Secondary Action
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-24">
          <Card className="p-8 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-accent rounded"></div>
            </div>
            <h3 className="mb-3">Clean Design</h3>
            <p className="text-muted-foreground">
              Carefully crafted with attention to detail and modern design principles.
            </p>
          </Card>
          
          <Card className="p-8 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-accent rounded"></div>
            </div>
            <h3 className="mb-3">Responsive</h3>
            <p className="text-muted-foreground">
              Optimized for all devices with a mobile-first approach and fluid layouts.
            </p>
          </Card>
          
          <Card className="p-8 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-accent rounded"></div>
            </div>
            <h3 className="mb-3">Customizable</h3>
            <p className="text-muted-foreground">
              Built with a flexible design system that's easy to extend and modify.
            </p>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-surface rounded-2xl p-12">
          <h2 className="mb-4">Ready to Start Building?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            This template provides a solid foundation with beautiful defaults that you can easily customize.
          </p>
          <Button size="lg" className="bg-gradient-primary border-0">
            Begin Your Project
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-surface/50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Template. Built with modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
