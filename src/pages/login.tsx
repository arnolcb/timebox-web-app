// src/pages/login.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Divider, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/');
    }
  }, [isAuthenticated, history]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Firebase popup login directly
      await login();
      
      // Navigation will happen automatically via useEffect
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="lucide:clock" className="text-primary text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Timebox</h1>
          <p className="text-foreground-500">
            Sign in to start organizing your day effectively
          </p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Sign in to continue</h2>
                <p className="text-sm text-foreground-500">
                  Get started with your Google account
                </p>
              </div>

              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:alert-circle" className="text-danger text-sm" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                </div>
              )}

              <Button
                color="primary"
                size="lg"
                className="w-full"
                onPress={handleGoogleSignIn}
                isLoading={isLoading}
                startContent={!isLoading ? <Icon icon="logos:google-icon" className="text-xl" /> : null}
              >
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <Divider />

              <div className="text-center">
                <p className="text-xs text-foreground-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-foreground-500">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-2">
                <Icon icon="lucide:target" className="text-primary" />
              </div>
              <span>Set Priorities</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-2">
                <Icon icon="lucide:brain" className="text-primary" />
              </div>
              <span>Brain Dump</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-2">
                <Icon icon="lucide:clock" className="text-primary" />
              </div>
              <span>Schedule</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};