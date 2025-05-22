import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show unauthorized access message
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        toast.error("Please log in to access this page");
      } else if (adminOnly && !isAdmin) {
        toast.error("Admin access required");
      }
    }
  }, [loading, requireAuth, adminOnly, isAuthenticated, isAdmin]);

  // Wait for auth state to be determined
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // If auth is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not an admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/client" replace />;
  }

  // If we reach here, it means the user is authorized
  return <>{children}</>;
}; 