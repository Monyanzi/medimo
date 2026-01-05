import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

// Lazy load all pages for code splitting
const HomeScreen = React.lazy(() => import("./pages/HomeScreen"));
const TimelineScreen = React.lazy(() => import("./pages/TimelineScreen"));
const VaultScreen = React.lazy(() => import("./pages/VaultScreen"));
const ProfileScreen = React.lazy(() => import("./pages/ProfileScreen"));
const PersonalMedicalPage = React.lazy(() => import("./pages/PersonalMedicalPage"));
const SettingsNotificationsPage = React.lazy(() => import("./pages/SettingsNotificationsPage"));
const LegalSupportPage = React.lazy(() => import("./pages/LegalSupportPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const OnboardingSetupPage = React.lazy(() => import("./pages/OnboardingSetupPage"));
const OnboardingCompletePage = React.lazy(() => import("./pages/OnboardingCompletePage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const EmergencyViewPage = React.lazy(() => import("./pages/EmergencyViewPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
  },
});

// Loading skeleton for Suspense fallback
const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen w-full bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-6">
      <div className="h-8 bg-muted rounded-lg animate-pulse w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded animate-pulse w-1/2 mx-auto" />
      <div className="h-32 bg-muted rounded-xl animate-pulse mt-8" />
      <div className="h-24 bg-muted rounded-xl animate-pulse" />
    </div>
  </div>
);

// Simple wrapper for page transitions - using only fade animation to avoid breaking fixed positioning
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-in fade-in duration-300 ease-out">
    {children}
  </div>
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppSettingsProvider>
              <HealthDataProvider>
                <NotificationProvider>
                  <TooltipProvider>
                    <ErrorBoundary>
                      <div id="main-content" className="min-h-screen w-full bg-background-main animate-in fade-in duration-500">
                        <Toaster />
                        <Sonner />
                        <Suspense fallback={<PageLoadingSkeleton />}>
                          <Routes>
                            {/* Public routes - /welcome redirects to login */}
                            <Route path="/welcome" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={
                              <AuthGuard requireAuth={false} redirectTo="/">
                                <PageWrapper><LoginPage /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/register" element={
                              <AuthGuard requireAuth={false} redirectTo="/">
                                <PageWrapper><RegisterPage /></PageWrapper>
                              </AuthGuard>
                            } />

                            {/* Protected routes */}
                            <Route path="/onboarding/setup" element={
                              <AuthGuard>
                                <PageWrapper><OnboardingSetupPage /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/onboarding/complete" element={
                              <AuthGuard>
                                <PageWrapper><OnboardingCompletePage /></PageWrapper>
                              </AuthGuard>
                            } />

                            {/* Main protected application routes */}
                            <Route path="/" element={
                              <AuthGuard>
                                <PageWrapper key="home"><HomeScreen /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/timeline" element={
                              <AuthGuard>
                                <PageWrapper key="timeline"><TimelineScreen /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/vault" element={
                              <AuthGuard>
                                <PageWrapper key="vault"><VaultScreen /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/profile" element={
                              <AuthGuard>
                                <PageWrapper key="profile"><ProfileScreen /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/profile/personal-medical" element={
                              <AuthGuard>
                                <PageWrapper><PersonalMedicalPage /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/profile/settings-notifications" element={
                              <AuthGuard>
                                <PageWrapper><SettingsNotificationsPage /></PageWrapper>
                              </AuthGuard>
                            } />
                            <Route path="/profile/legal-support" element={
                              <AuthGuard>
                                <PageWrapper><LegalSupportPage /></PageWrapper>
                              </AuthGuard>
                            } />

                            {/* Public emergency view - no auth required */}
                            <Route path="/e" element={<PageWrapper><EmergencyViewPage /></PageWrapper>} />

                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </div>
                    </ErrorBoundary>
                  </TooltipProvider>
                </NotificationProvider>
              </HealthDataProvider>
            </AppSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
