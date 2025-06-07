// src/config.ts

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Validate that required environment variables are set
if (!GOOGLE_CLIENT_ID && import.meta.env.MODE === 'production') {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required in production');
}

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Timebox',
  version: '1.0.0',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173'
  },
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production'
};

// Log configuration in development
if (APP_CONFIG.isDevelopment) {
  console.log('🔧 App Configuration:', {
    clientId: GOOGLE_CLIENT_ID ? `✅ Configured (${GOOGLE_CLIENT_ID.substring(0, 20)}...)` : '❌ Missing',
    environment: import.meta.env.MODE,
    apiUrl: APP_CONFIG.api.baseUrl
  });
}