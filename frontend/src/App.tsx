
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DataProvider } from "@/context/DataContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Monitoring from "./pages/Monitoring";
import MapPage from "./pages/Map";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Personnel from "./pages/Personnel";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <div className="p-4 flex-1">
                  <div className="container mx-auto">
                    <SidebarTrigger className="block md:hidden mb-4" />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/personnel" element={<Personnel />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
