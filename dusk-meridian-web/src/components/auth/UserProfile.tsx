import React, { useState } from 'react';
import { User, Wallet, Copy, ExternalLink, LogOut, Settings } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { cn } from '@/utils/cn';

interface UserProfileProps {
  compact?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ compact = false, className }) => {
  const { user, logout, connectWallet, walletAddress, isLoading } = useIMXAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.nickname || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary-foreground" />
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">
            {user?.nickname || user?.email || 'User'}
          </span>
          {walletAddress && (
            <span className="text-xs text-muted-foreground">
              {formatAddress(walletAddress)}
            </span>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
      <h3 className="text-lg font-semibold mb-4">Profile</h3>

      {/* User Information */}
      <div className="space-y-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.nickname || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{user?.nickname || 'User'}</h4>
            {user?.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
            <p className="text-xs text-muted-foreground">ID: {user?.sub}</p>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="border-t border-border pt-4">
          <h5 className="font-medium mb-2 flex items-center">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </h5>

          {walletAddress ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-background rounded border">
                <span className="text-sm font-mono flex-1">{walletAddress}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(`https://immutascan.io/address/${walletAddress}`, '_blank')}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-400">Address copied to clipboard!</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                No wallet connected
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-border pt-4 flex space-x-2">
          <button className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};