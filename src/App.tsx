import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { WelcomePage } from "./pages/welcome";
import { TimeboxPage } from "./pages/timebox";
import { SettingsPage } from "./pages/settings";
import { LoginPage } from "./pages/login";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route path="/login">
            <LoginPage />
          </Route>
          
          <Route path="*">
            <Layout>
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
            </Layout>
          </Route>
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  );
}