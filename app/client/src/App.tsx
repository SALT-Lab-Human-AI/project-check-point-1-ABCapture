import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { PrivacyProvider } from "@/contexts/privacy-context";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import Chat from "@/pages/chat";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import StudentDetail from "@/pages/student-detail";
import History from "@/pages/history";
import RecordIncident from "@/pages/record-incident";
import RecordIncidentSelect from "@/pages/record-incident-select";
import Settings from "@/pages/settings";
import HelpSupport from "@/pages/help-support";
import ParentDashboard from "@/pages/parent-dashboard";
import AllTeachers from "@/pages/all-teachers";
import TeacherDetail from "@/pages/teacher-detail";
import AdminRecentIncidents from "@/pages/admin-recent-incidents";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show login/signup/reset routes for unauthenticated users
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/login" component={Login} />
        <Route path="/" component={Login} />
      </Switch>
    );
  }

  // Administrator-specific routes
  if (user?.role === "administrator") {
    return (
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/teachers" component={AllTeachers} />
        <Route path="/admin/teachers/:id" component={TeacherDetail} />
        <Route path="/admin/incidents" component={AdminRecentIncidents} />
        <Route path="/students/:studentId" component={StudentDetail} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={HelpSupport} />
        {/* Redirect all other routes to admin home */}
        <Route>
          <Redirect to="/admin/dashboard" />
        </Route>
      </Switch>
    );
  }

  // Parent-specific routes
  if (user?.role === "parent") {
    return (
      <Switch>
        <Route path="/" component={ParentDashboard} />
        <Route path="/settings" component={Settings} />
        {/* Redirect all teacher-only pages to parent dashboard */}
        <Route path="/dashboard">
          <Redirect to="/" />
        </Route>
        <Route path="/students">
          <Redirect to="/" />
        </Route>
        <Route path="/students/:studentId">
          <Redirect to="/" />
        </Route>
        <Route path="/history">
          <Redirect to="/" />
        </Route>
        <Route path="/record/:studentId">
          <Redirect to="/" />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  // Teacher routes (default)
  return (
    <Switch>
      <Route path="/" component={RecordIncidentSelect} />
      <Route path="/signup">
        <Redirect to="/" />
      </Route>
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route path="/chat" component={Chat} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/students/:studentId" component={StudentDetail} />
      <Route path="/history" component={History} />
      <Route path="/record-incident" component={RecordIncidentSelect} />
      <Route path="/record/:studentId" component={RecordIncident} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={HelpSupport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UserProfileHeader() {
  const { user } = useAuth();
  
  return (
    <Link href="/settings" className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.photoUrl || ""} alt={user?.firstName || "User"} />
        <AvatarFallback>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">
          {user?.firstName} {user?.lastName}
        </span>
        <span className="text-xs text-muted-foreground">
          {user?.role}
        </span>
      </div>
    </Link>
  );
}

function AuthenticatedLayout() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider defaultOpen={true} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <UserProfileHeader />
              <PrivacyToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return <Router />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PrivacyProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
