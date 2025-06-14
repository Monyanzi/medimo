
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import HomeScreen from "./pages/HomeScreen";
import TimelineScreen from "./pages/TimelineScreen";
import VaultScreen from "./pages/VaultScreen";
import ProfileScreen from "./pages/ProfileScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('App component rendering');
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HealthDataProvider>
            <TooltipProvider>
              <div className="min-h-screen w-full bg-background-main">
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/timeline" element={<TimelineScreen />} />
                  <Route path="/vault" element={<VaultScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </TooltipProvider>
          </HealthDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
