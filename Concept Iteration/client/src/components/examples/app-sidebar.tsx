import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold">Main Content Area</h2>
          <p className="text-muted-foreground mt-2">
            This is where your page content would appear.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
