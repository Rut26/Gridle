// src/app/settings/page.jsx
"use client";

import React, { useState } from 'react';
import { PlusIcon } from '../../components/ui/ClientLayout'; // PlusIcon might not be used here, but kept for consistency

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [popupNotifications, setPopupNotifications] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState('1 hour before');
  const [aiPrioritization, setAiPrioritization] = useState(true);
  const [aiReminderIntensity, setAiReminderIntensity] = useState('Medium');
  const [grammarAutocorrection, setGrammarAutocorrection] = useState(true);

  const handleSaveChanges = () => {
    alert('Settings saved! (Simulated)');
    console.log({
      emailNotifications,
      popupNotifications,
      reminderFrequency,
      aiPrioritization,
      aiReminderIntensity,
      grammarAutocorrection,
    });
  };

  return (
    // NO <ClientLayout> wrapper here. It's handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Profile Settings</h3>
        <div className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
            <input type="text" id="name" defaultValue="John Doe" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input type="email" id="email" defaultValue="john.doe@example.com" readOnly className="w-full p-3 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly here.</p>
          </div>
          <button className="bg-secondary text-secondary-foreground px-5 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="text-foreground font-medium">Email Notifications</label>
            <input type="checkbox" id="email-notifications" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="popup-notifications" className="text-foreground font-medium">In-App Popups</label>
            <input type="checkbox" id="popup-notifications" checked={popupNotifications} onChange={(e) => setPopupNotifications(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="reminder-frequency" className="block text-sm font-medium text-muted-foreground mb-1">Reminder Frequency</label>
            <select id="reminder-frequency" value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground">
              <option>15 minutes before</option>
              <option>1 hour before</option>
              <option>Daily Summary</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Integrations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3h-3V1h-2v2H8V1H6v2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H3V9h18v12zm0-14H3V5h18v2zM7 11h10v2H7zm0 4h10v2H7z"/></svg>
              Google Calendar
            </span>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors">
              Connect Account
            </button>
            {/* Or if connected:
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold hover:bg-destructive/80 transition-colors">
              Disconnect
            </button>
            */}
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">AI Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="ai-prioritization" className="text-foreground font-medium">Enable AI Prioritization</label>
            <input type="checkbox" id="ai-prioritization" checked={aiPrioritization} onChange={(e) => setAiPrioritization(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="ai-reminder-intensity" className="block text-sm font-medium text-muted-foreground mb-1">AI Reminder Intensity</label>
            <select id="ai-reminder-intensity" value={aiReminderIntensity} onChange={(e) => setAiReminderIntensity(e.target.value)} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="grammar-autocorrection" className="text-foreground font-medium">Grammar Autocorrection</label>
            <input type="checkbox" id="grammar-autocorrection" checked={grammarAutocorrection} onChange={(e) => setGrammarAutocorrection(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={handleSaveChanges} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors duration-200 shadow-md">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;