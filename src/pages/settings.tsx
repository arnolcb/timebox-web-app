// src/pages/settings.tsx
import React from "react";
import { Card, CardHeader, CardBody, Divider, Switch, Avatar, Button, Input, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
import { useAuth } from "../contexts/AuthContext";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserSettings {
  notifications: {
    email: boolean;
    reminders: boolean;
    weeklyReport: boolean;
  };
  preferences: {
    startTime: string;
    endTime: string;
    timeInterval: string;
    darkMode: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    reminders: true,
    weeklyReport: false
  },
  preferences: {
    startTime: "08:00",
    endTime: "18:00",
    timeInterval: "30",
    darkMode: false
  }
};

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [userSettings, setUserSettings] = React.useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Load user settings from Firebase
  React.useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.settings) {
            setUserSettings({ ...defaultSettings, ...data.settings });
            // Apply dark mode from saved settings
            if (data.settings.preferences?.darkMode !== undefined) {
              setTheme(data.settings.preferences.darkMode ? "dark" : "light");
            }
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, setTheme]);

  // Save settings to Firebase
  const saveSettings = async (newSettings: UserSettings) => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { 
        settings: newSettings,
        updatedAt: new Date()
      }, { merge: true });
      
      setUserSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNotificationChange = async (key: keyof typeof userSettings.notifications) => {
    const newSettings = {
      ...userSettings,
      notifications: {
        ...userSettings.notifications,
        [key]: !userSettings.notifications[key]
      }
    };
    await saveSettings(newSettings);
  };
  
  const handlePreferenceChange = async (key: keyof typeof userSettings.preferences, value: string | boolean) => {
    const newSettings = {
      ...userSettings,
      preferences: {
        ...userSettings.preferences,
        [key]: value
      }
    };
    
    // If changing dark mode, apply immediately
    if (key === 'darkMode') {
      setTheme(value ? "dark" : "light");
    }
    
    await saveSettings(newSettings);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <Icon icon="lucide:user-x" className="text-4xl text-foreground-300 mb-4" />
          <p className="text-foreground-500">Please log in to access settings.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs aria-label="Settings options">
        <Tab key="profile" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:user" />
            <span>Profile</span>
          </div>
        }>
          <Card className="mt-4">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">User Profile</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    src={user.avatar}
                    className="w-24 h-24"
                    showFallback
                    name={user.name}
                  />
                  <p className="text-xs text-foreground-400 text-center">
                    Avatar is managed by your Google account
                  </p>
                </div>
                
                <div className="flex-1 space-y-4">
                  <Input
                    label="Name"
                    value={user.name}
                    isReadOnly
                    description="This name is synced from your Google account"
                  />
                  <Input
                    label="Email"
                    value={user.email}
                    isReadOnly
                    type="email"
                    description="Email cannot be changed - it's linked to your Google account"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        
        <Tab key="preferences" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:settings" />
            <span>Preferences</span>
          </div>
        }>
          <Card className="mt-4">
            <CardHeader>
              <h2 className="text-lg font-semibold">Timebox Preferences</h2>
              {isSaving && <Icon icon="lucide:loader-2" className="animate-spin ml-2" />}
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-foreground-500">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    isSelected={userSettings.preferences.darkMode}
                    onValueChange={(value) => handlePreferenceChange("darkMode", value)}
                    startContent={<Icon icon="lucide:sun" />}
                    endContent={<Icon icon="lucide:moon" />}
                    isDisabled={isSaving}
                  />
                </div>
                
                <Divider />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Schedule Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="time"
                      label="Default Start Time"
                      value={userSettings.preferences.startTime}
                      onValueChange={(value) => handlePreferenceChange("startTime", value)}
                      isDisabled={isSaving}
                    />
                    <Input
                      type="time"
                      label="Default End Time"
                      value={userSettings.preferences.endTime}
                      onValueChange={(value) => handlePreferenceChange("endTime", value)}
                      isDisabled={isSaving}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="text-sm">Time Interval:</p>
                    <div className="flex gap-2">
                      {["15", "30", "60"].map((interval) => (
                        <Button
                          key={interval}
                          size="sm"
                          variant={userSettings.preferences.timeInterval === interval ? "solid" : "flat"}
                          color={userSettings.preferences.timeInterval === interval ? "primary" : "default"}
                          onPress={() => handlePreferenceChange("timeInterval", interval)}
                          isDisabled={isSaving}
                        >
                          {interval} min
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Email Notifications</p>
                        <p className="text-sm text-foreground-500">Receive timebox reminders via email</p>
                      </div>
                      <Switch
                        isSelected={userSettings.notifications.email}
                        onValueChange={() => handleNotificationChange("email")}
                        isDisabled={isSaving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Daily Reminders</p>
                        <p className="text-sm text-foreground-500">Get reminded to create your daily timebox</p>
                      </div>
                      <Switch
                        isSelected={userSettings.notifications.reminders}
                        onValueChange={() => handleNotificationChange("reminders")}
                        isDisabled={isSaving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Weekly Report</p>
                        <p className="text-sm text-foreground-500">Receive a weekly summary of your timeboxes</p>
                      </div>
                      <Switch
                        isSelected={userSettings.notifications.weeklyReport}
                        onValueChange={() => handleNotificationChange("weeklyReport")}
                        isDisabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        
        <Tab key="account" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:shield" />
            <span>Account</span>
          </div>
        }>
          <Card className="mt-4">
            <CardHeader>
              <h2 className="text-lg font-semibold">Account Settings</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon="logos:google-icon" className="text-xl" />
                    <div>
                      <h3 className="font-medium">Google Account</h3>
                      <p className="text-sm text-foreground-500">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground-600">
                    Your account is secured through Google. Password and security settings 
                    are managed through your Google account.
                  </p>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="mt-3"
                    startContent={<Icon icon="lucide:external-link" />}
                    onPress={() => window.open('https://myaccount.google.com/security', '_blank')}
                  >
                    Manage Google Security
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};