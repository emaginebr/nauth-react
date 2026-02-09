import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireAdmin?: boolean;
  onUnauthorized?: () => void;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const {
    redirectTo = '/login',
    requireAdmin = false,
    onUnauthorized,
  } = options;

  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      navigate(redirectTo);
      return;
    }

    if (requireAdmin && !user?.isAdmin) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, isLoading, navigate, redirectTo, requireAdmin, onUnauthorized]);

  return {
    isAuthenticated,
    user,
    isLoading,
    isAuthorized: isAuthenticated && (!requireAdmin || user?.isAdmin),
  };
};
