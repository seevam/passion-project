'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  Globe,
  Zap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsData {
  publicProfile: boolean;
  emailOptIn: boolean;
  pushOptIn: boolean;
}

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<SettingsData>({
    publicProfile: false,
    emailOptIn: true,
    pushOptIn: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      // setSettings(data.settings);

      // Mock data for now
      setSettings({
        publicProfile: false,
        emailOptIn: true,
        pushOptIn: true,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof SettingsData) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="mx-auto h-12 w-12 animate-spin text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">⚙️ Settings</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Manage your account preferences and privacy
        </p>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="animate-in slide-in-from-top rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-md">
              <Save className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Settings saved successfully!</p>
              <p className="text-sm text-green-700">Your preferences have been updated.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Account Information */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2 bg-gradient-to-r from-primary-50 to-secondary-50">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Account Information
              </CardTitle>
              <CardDescription>Your basic account details from Clerk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
                <Input
                  id="name"
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'}
                  disabled
                  className="mt-2 border-2 bg-gray-50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Managed through your Clerk account
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.emailAddresses[0]?.emailAddress || 'Not set'}
                  disabled
                  className="mt-2 border-2 bg-gray-50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Primary email for notifications and updates
                </p>
              </div>

              {/* User ID */}
              <div>
                <Label className="text-base font-semibold">User ID</Label>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded-lg border-2 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-600">
                    {user?.id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2 bg-gradient-to-r from-secondary-50 to-accent-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary-600" />
                Privacy & Visibility
              </CardTitle>
              <CardDescription>Control who can see your profile and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Public Profile Toggle */}
              <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-primary-300">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {settings.publicProfile ? (
                      <Eye className="h-5 w-5 text-primary-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                    <Label htmlFor="publicProfile" className="text-base font-semibold">
                      Public Profile
                    </Label>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Show your profile on the leaderboard and gallery
                  </p>
                  {settings.publicProfile && (
                    <Badge variant="default" className="mt-2">
                      <Globe className="mr-1 h-3 w-3" />
                      Visible to everyone
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => toggleSetting('publicProfile')}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    settings.publicProfile ? 'bg-primary-500' : 'bg-gray-300'
                  )}
                  role="switch"
                  aria-checked={settings.publicProfile}
                >
                  <div
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform',
                      settings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2 bg-gradient-to-r from-accent-50 to-primary-50">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Email Notifications */}
              <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-gray-200 bg-white p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-secondary-600" />
                    <Label htmlFor="emailOptIn" className="text-base font-semibold">
                      Email Notifications
                    </Label>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Receive updates about your projects, achievements, and streaks
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('emailOptIn')}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    settings.emailOptIn ? 'bg-primary-500' : 'bg-gray-300'
                  )}
                  role="switch"
                  aria-checked={settings.emailOptIn}
                >
                  <div
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform',
                      settings.emailOptIn ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-gray-200 bg-white p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent-600" />
                    <Label htmlFor="pushOptIn" className="text-base font-semibold">
                      Push Notifications
                    </Label>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get instant alerts for important updates and reminders
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('pushOptIn')}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    settings.pushOptIn ? 'bg-primary-500' : 'bg-gray-300'
                  )}
                  role="switch"
                  aria-checked={settings.pushOptIn}
                >
                  <div
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform',
                      settings.pushOptIn ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button Card */}
          <Card className="border-2 border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-duo">
            <CardContent className="pt-6">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full gap-2 shadow-duo"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your settings are saved automatically
              </p>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="border-b-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <Badge variant="default">Free Plan</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Status</span>
                <Badge variant={settings.publicProfile ? 'default' : 'secondary'}>
                  {settings.publicProfile ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
              <Button
                variant="outline"
                className="w-full border-2 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled
              >
                Delete Account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Contact support to delete your account
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
