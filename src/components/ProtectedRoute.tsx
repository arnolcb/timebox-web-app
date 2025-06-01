import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@heroui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
  exact?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  path, 
  exact 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-foreground-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Route path={path} exact={exact}>
      {isAuthenticated ? children : <Redirect to="/login" />}
    </Route>
  );
};