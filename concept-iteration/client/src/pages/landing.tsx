import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" data-testid="text-app-title">ABCapture</h1>
          <Button onClick={handleLogin} data-testid="button-login-header">
            Log In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Behavioral Incident Documentation Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline ABC form creation for students with autism using AI-powered conversations and comprehensive analytics
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
            Get Started
          </Button>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Smart ABC Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AI-assisted conversation turns your incident descriptions into structured ABC forms automatically
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track behavior patterns with comprehensive charts, time heatmaps, and week-over-week trends
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Student Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Individual dashboards for each student with detailed incident history and behavioral insights
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Privacy Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Present data safely during screen sharing with built-in privacy protection for student information
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Documentation?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join special education teachers using ABCapture to save time and improve student outcomes
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-login-cta">
            Log In to Get Started
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ABCapture. Behavioral incident documentation for special education.</p>
        </div>
      </footer>
    </div>
  );
}
