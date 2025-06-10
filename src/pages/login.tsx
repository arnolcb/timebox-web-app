// src/pages/login.tsx - Modern redesign
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/');
    }
  }, [isAuthenticated, history]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login();
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6 w-28 h-28 md:w-36 md:h-36">
            {/* Your custom logo - no background container */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 100 100"
              className="w-full h-full transform hover:scale-110 transition-all duration-300"
              style={{
                animation: 'bounce 2s infinite, float 3s ease-in-out infinite',
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
              }}
            >
              {/* Cara superior */}
              <path d="M10 30 L50 5 L90 30 L50 55 Z" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
              {/* Cara izquierda */}
              <path d="M10 30 L10 70 L50 95 L50 55 Z" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
              {/* Cara derecha */}
              <path d="M50 55 L50 95 L90 70 L90 30 Z" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Welcome to Timebox
          </h1>
          <p className="text-slate-600 text-sm md:text-base px-4">
            Organize your day with purpose and clarity
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardBody className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                  Sign in to continue
                </h2>
                <p className="text-sm text-slate-500">
                  Get started with your Google account
                </p>
              </div>

              {error && (
                <div 
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                  style={{
                    animation: showError ? 'shake 0.5s ease-in-out' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-red-100 rounded-full">
                      <Icon icon="lucide:alert-circle" className="text-red-600 text-sm" />
                    </div>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <Button
                color="primary"
                size="lg"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                onPress={handleGoogleSignIn}
                isLoading={isLoading}
                startContent={
                  !isLoading ? (
                    <Icon icon="logos:google-icon" className="text-lg" />
                  ) : null
                }
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  "Continue with Google"
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Floating Features - More subtle */}
        <div className="mt-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-center gap-8 text-xs text-slate-500">
            <div className="flex flex-col items-center group">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <Icon icon="lucide:target" className="text-blue-600 text-sm" />
              </div>
              <span>Priorities</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <Icon icon="lucide:brain" className="text-blue-600 text-sm" />
              </div>
              <span>Brain Dump</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <Icon icon="lucide:clock" className="text-blue-600 text-sm" />
              </div>
              <span>Schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Custom keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: scale(1); }
          40%, 43% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};