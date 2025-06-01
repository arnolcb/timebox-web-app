import React, { useEffect, useState, useRef } from 'react';
import { Card, CardBody, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { GOOGLE_CLIENT_ID } from '../config';

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializationAttempts = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/');
    }
  }, [isAuthenticated, history]);

  // Global callback function
  window.handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(response.credential);
      history.push('/');
    } catch (error) {
      console.error('Login processing failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (initializationAttempts.current > 3) {
        setError('Unable to load Google Sign-In. Please refresh the page.');
        return;
      }

      initializationAttempts.current++;

      if (window.google?.accounts?.id) {
        try {
          // Cancel any existing operations
          window.google.accounts.id.cancel();
          
          // Initialize with fresh state
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: window.handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
            itp_support: true
          });

          // Clear and render the button
          const buttonElement = document.getElementById(`google-signin-button-${key}`);
          if (buttonElement) {
            buttonElement.innerHTML = '';
            
            setTimeout(() => {
              try {
                window.google.accounts.id.renderButton(
                  buttonElement,
                  {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                    shape: 'rectangular'
                  }
                );
                setError(null);
              } catch (renderError) {
                console.error('Error rendering Google button:', renderError);
                setError('Failed to load sign-in button.');
              }
            }, 100);
          }
          
        } catch (error) {
          console.error('Google initialization error:', error);
          setError('Failed to initialize Google Sign-In.');
        }
      } else {
        setTimeout(initializeGoogle, 1000);
      }
    };

    const loadGoogleScript = () => {
      const existingScript = document.querySelector('script[src*="accounts.google.com"]');
      if (existingScript) {
        setTimeout(initializeGoogle, 200);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initializeGoogle, 500);
      };
      script.onerror = () => {
        setError('Failed to load Google Sign-In service.');
      };
      document.head.appendChild(script);
    };

    const timer = setTimeout(loadGoogleScript, 300);

    return () => {
      clearTimeout(timer);
      if (window.handleCredentialResponse) {
        delete window.handleCredentialResponse;
      }
    };
  }, [key]);

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-danger-50 to-warning-50 p-4">
        <Card className="max-w-md shadow-lg">
          <CardBody className="p-8 text-center">
            <Icon icon="lucide:alert-triangle" className="text-danger text-4xl mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2 text-danger">Configuration Required</h2>
            <p className="text-sm text-foreground-600">
              Please configure your Google OAuth credentials.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

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

              {isLoading && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:loader-2" className="text-primary text-sm animate-spin" />
                    <p className="text-sm text-primary">Signing you in...</p>
                  </div>
                </div>
              )}

              {/* Google Sign-In Button Container */}
              <div className="flex justify-center">
                <div 
                  id={`google-signin-button-${key}`} 
                  ref={buttonRef}
                  className="w-full min-h-[40px] flex items-center justify-center"
                >
                  {/* Loading state while Google button loads */}
                  {!error && !isLoading && (
                    <div className="flex items-center gap-2 text-foreground-400">
                      <Icon icon="lucide:loader-2" className="animate-spin text-sm" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              </div>

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