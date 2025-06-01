// Type declarations for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google OAuth Configuration usando Vite env vars
// @ts-ignore
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Validate that required environment variables are set
// @ts-ignore
if (!GOOGLE_CLIENT_ID && import.meta.env.MODE === 'production') {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required in production');
}

// App Configuration

export const APP_CONFIG = {
// @ts-ignore
  name: import.meta.env.VITE_APP_NAME || 'Timebox',
  version: '1.0.0',
  api: {
    // @ts-ignore
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173'
  },
  // @ts-ignore
  isDevelopment: import.meta.env.MODE === 'development',
  // @ts-ignore
  isProduction: import.meta.env.MODE === 'production'
};

// Log configuration in development
if (APP_CONFIG.isDevelopment) {
  console.log('🔧 App Configuration:', {
    clientId: GOOGLE_CLIENT_ID ? `✅ Configured (${GOOGLE_CLIENT_ID.substring(0, 20)}...)` : '❌ Missing',
    // @ts-ignore
    environment: import.meta.env.MODE,
    apiUrl: APP_CONFIG.api.baseUrl
  });
}