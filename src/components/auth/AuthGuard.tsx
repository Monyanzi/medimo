
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MockAuthService } from '@/services/mockAuthService';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' // Changed default from /welcome to /login
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = MockAuthService.getCurrentUser();
      setIsAuthenticated(!!currentUser);
      setIsLoading(false);

      if (requireAuth && !currentUser) {
        // Save the attempted location for redirect after login
        navigate(redirectTo, { 
          state: { from: location.pathname } 
        });
      } else if (!requireAuth && currentUser) {
        // User is logged in but trying to access auth pages
        if (currentUser.isOnboardingComplete) {
          navigate('/');
        } else {
          navigate('/onboarding/setup');
        }
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Loading...</h2>
          <p className="text-text-secondary">Please wait</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

export default AuthGuard;
