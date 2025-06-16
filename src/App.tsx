
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AuthGuard from "@/components/auth/AuthGuard";
import HomeScreen from "./pages/HomeScreen";
import TimelineScreen from "./pages/TimelineScreen";
import VaultScreen from "./pages/VaultScreen";
import ProfileScreen from "./pages/ProfileScreen";
import PersonalMedicalPage from "./pages/PersonalMedicalPage";
import SettingsNotificationsPage from "./pages/SettingsNotificationsPage";
import LegalSupportPage from "./pages/LegalSupportPage";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingSetupPage from "./pages/OnboardingSetupPage";
import OnboardingCompletePage from "./pages/OnboardingCompletePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <HealthDataProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <div className="min-h-screen w-full bg-background-main">
                    <Toaster />
                    <Sonner />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/welcome" element={<WelcomePage />} />
                      <Route path="/login" element={
                        <AuthGuard requireAuth={false} redirectTo="/"> {/* Redirect to home if logged in */}
                          <LoginPage />
                        </AuthGuard>
                      } />
                      <Route path="/register" element={
                        <AuthGuard requireAuth={false} redirectTo="/"> {/* Redirect to home if logged in */}
                          <RegisterPage />
                        </AuthGuard>
                      } />
                      
                      {/* Protected routes - Onboarding has its own AuthGuard logic often */}
                      {/* For this setup, AuthGuard will handle redirection if user is not authenticated */}
                      <Route path="/onboarding/setup" element={
                        <AuthGuard>
                          <OnboardingSetupPage />
                        </AuthGuard>
                      } />
                      <Route path="/onboarding/complete" element={
                        <AuthGuard>
                          <OnboardingCompletePage />
                        </AuthGuard>
                      } />

                      {/* Main protected application routes */}
                      <Route path="/" element={
                        <AuthGuard>
                          <HomeScreen />
                        </AuthGuard>
                      } />
                      <Route path="/timeline" element={
                        <AuthGuard>
                          <TimelineScreen />
                        </AuthGuard>
                      } />
                      <Route path="/vault" element={
                        <AuthGuard>
                          <VaultScreen />
                        </AuthGuard>
                      } />
                      <Route path="/profile" element={
                        <AuthGuard>
                          <ProfileScreen />
                        </AuthGuard>
                      } />
                      <Route path="/profile/personal-medical" element={
                        <AuthGuard>
                          <PersonalMedicalPage />
                        </AuthGuard>
                      } />
                      <Route path="/profile/settings-notifications" element={
                        <AuthGuard>
                          <SettingsNotificationsPage />
                        </AuthGuard>
                      } />
                      <Route path="/profile/legal-support" element={
                        <AuthGuard>
                          <LegalSupportPage />
                        </AuthGuard>
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </TooltipProvider>
              </NotificationProvider>
            </HealthDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
