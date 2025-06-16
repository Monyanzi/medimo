
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Use AuthContext

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login'
}) => {
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and loading state from context
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait for AuthContext to determine authentication status
    }

    if (requireAuth && !user) {
      // If authentication is required and user is not logged in, redirect to login
      navigate(redirectTo, {
        state: { from: location.pathname }, // Pass the original location
        replace: true
      });
    } else if (!requireAuth && user) {
      // If authentication is NOT required (e.g., login/register page) AND user IS logged in
      if (user.isOnboardingComplete) {
        navigate('/', { replace: true }); // Redirect to home
      } else {
        navigate('/onboarding/setup', { replace: true }); // Redirect to onboarding
      }
    }
    // No action needed if:
    // 1. requireAuth is true AND user is logged in (allow access to children)
    // 2. requireAuth is false AND user is NOT logged in (allow access to children, e.g. login page)
  }, [isAuthLoading, user, requireAuth, redirectTo, navigate, location]);

  if (isAuthLoading) {
    // Show a loading indicator while AuthContext is initializing
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Verifying session...</h2>
          <p className="text-text-secondary">Please wait</p>
        </div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated (after loading),
  // this component will have already triggered a redirect, so return null.
  if (requireAuth && !user) {
    return null;
  }

  // If this guard is for public routes (requireAuth=false) and user is logged in (after loading),
  // this component will have already triggered a redirect, so return null.
  if (!requireAuth && user) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default AuthGuard;
