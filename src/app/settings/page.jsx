// src/app/settings/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: {
      emailNotifications: true,
      popupNotifications: true,
      reminderFrequency: '1 hour before',
      aiPrioritization: true,
      aiReminderIntensity: 'Medium',
      grammarAutocorrection: true,
    }
  });

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile({
          name: data.data.name || '',
          email: data.data.email || '',
          preferences: {
            emailNotifications: data.data.preferences?.emailNotifications ?? true,
            popupNotifications: data.data.preferences?.popupNotifications ?? true,
            reminderFrequency: data.data.preferences?.reminderFrequency || '1 hour before',
            aiPrioritization: data.data.preferences?.aiPrioritization ?? true,
            aiReminderIntensity: data.data.preferences?.aiReminderIntensity || 'Medium',
            grammarAutocorrection: data.data.preferences?.grammarAutocorrection ?? true,
          }
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          preferences: profile.preferences,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="relative h-full flex flex-col space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={profile.email}
                readOnly 
                className="mt-1 bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly here.</p>
            </div>
            <Button variant="secondary">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <input 
                type="checkbox" 
                id="email-notifications" 
                checked={profile.preferences.emailNotifications} 
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="popup-notifications">In-App Popups</Label>
              <input 
                type="checkbox" 
                id="popup-notifications" 
                checked={profile.preferences.popupNotifications} 
                onChange={(e) => updatePreference('popupNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" 
              />
            </div>
            <div>
              <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
              <select 
                id="reminder-frequency" 
                value={profile.preferences.reminderFrequency} 
                onChange={(e) => updatePreference('reminderFrequency', e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mt-1"
              >
                <option>15 minutes before</option>
                <option>1 hour before</option>
                <option>Daily Summary</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 3h-3V1h-2v2H8V1H6v2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H3V9h18v12zm0-14H3V5h18v2zM7 11h10v2H7zm0 4h10v2H7z"/>
                </svg>
                Google Calendar
              </span>
              <Button>
                Connect Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-prioritization">Enable AI Prioritization</Label>
              <input 
                type="checkbox" 
                id="ai-prioritization" 
                checked={profile.preferences.aiPrioritization} 
                onChange={(e) => updatePreference('aiPrioritization', e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" 
              />
            </div>
            <div>
              <Label htmlFor="ai-reminder-intensity">AI Reminder Intensity</Label>
              <select 
                id="ai-reminder-intensity" 
                value={profile.preferences.aiReminderIntensity} 
                onChange={(e) => updatePreference('aiReminderIntensity', e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mt-1"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="grammar-autocorrection">Grammar Autocorrection</Label>
              <input 
                type="checkbox" 
                id="grammar-autocorrection" 
                checked={profile.preferences.grammarAutocorrection} 
                onChange={(e) => updatePreference('grammarAutocorrection', e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleSaveChanges} 
          disabled={saving}
          className="px-6 py-3"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;