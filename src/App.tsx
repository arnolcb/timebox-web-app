// src/App.tsx - Optimized with lazy loading
import React, { Suspense } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Spinner } from "@heroui/react";

// Lazy load components for better performance
const WelcomePage = React.lazy(() => import("./pages/welcome").then(module => ({ default: module.WelcomePage })));
const TimeboxPage = React.lazy(() => import("./pages/timebox").then(module => ({ default: module.TimeboxPage })));
const SettingsPage = React.lazy(() => import("./pages/settings").then(module => ({ default: module.SettingsPage })));
const LoginPage = React.lazy(() => import("./pages/login").then(module => ({ default: module.LoginPage })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" color="primary" />
      <p className="mt-4 text-foreground-500">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route path="/login">
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          </Route>
          
          <Route path="*">
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Switch>
                  <ProtectedRoute exact path="/">
                    <WelcomePage />
                  </ProtectedRoute>
                  
                  <ProtectedRoute path="/timebox/:id">
                    <TimeboxPage />
                  </ProtectedRoute>
                  
                  <ProtectedRoute path="/settings">
                    <SettingsPage />
                  </ProtectedRoute>
                </Switch>
              </Suspense>
            </Layout>
          </Route>
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  );
}