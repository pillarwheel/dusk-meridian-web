import React from 'react';
import { UserProfile } from '@/components/auth/UserProfile';

export const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and wallet settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <UserProfile />

        {/* Game Statistics */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Playtime</span>
              <span className="font-medium">24h 32m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Characters Created</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Settlements Founded</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quests Completed</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Battles Won</span>
              <span className="font-medium">23</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span>Sound Effects</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-save</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span>Show Tooltips</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>

        {/* NFTs & Assets */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">NFTs & Digital Assets</h3>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Your NFTs and digital assets will appear here
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              View on Immutable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};