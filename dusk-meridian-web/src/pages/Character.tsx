import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Clock, MapPin, Sword, Shield, Crown, Target, Wallet } from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { characterApi } from '@/api/endpoints/character';
import * as CharacterTypes from '@/api/types/character';
import { ROUTES } from '@/utils/constants';

export const Character: React.FC = () => {
  const navigate = useNavigate();
  const { user, walletAddress, connectWallet, isLoading: authLoading } = useIMXAuth();
  const [characters, setCharacters] = useState<{characters?: CharacterTypes.Character[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacters();
  }, [walletAddress]);

  // Auto-reload characters when wallet gets connected
  useEffect(() => {
    if (walletAddress && (characters?.characters?.length || 0) === 0 && !isLoading && !error) {
      loadCharacters();
    }
  }, [walletAddress, characters?.characters?.length, isLoading, error]);

  const loadCharacters = async () => {
    if (!walletAddress) {
      setCharacters({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await characterApi.getCharacters();
      setCharacters(data);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('Failed to load characters. Please check if the game server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'Guardian': return Shield;
      case 'Striker': return Sword;
      case 'Specialist': return Target;
      case 'Coordinator': return Crown;
      default: return User;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-green-400';
      case 'traveling': return 'text-blue-400';
      case 'in_combat': return 'text-red-400';
      case 'crafting': return 'text-yellow-400';
      case 'resting': return 'text-purple-400';
      case 'dead': return 'text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-lg">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            You're logged in, but need to connect your IMX Passport wallet to view your characters
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-2">Your Account:</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Email: <span className="font-mono">{user?.email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              User ID: <span className="font-mono">{user?.sub}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Status: Authenticated, but wallet not connected
            </p>
          </div>

          <button
            onClick={connectWallet}
            disabled={authLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mb-4 disabled:opacity-50"
          >
            {authLoading ? 'Connecting...' : 'Connect IMX Passport Wallet'}
          </button>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1">• Your characters are associated with your wallet address</p>
            <p className="mb-1">• IMX Passport provides secure wallet functionality</p>
            <p>• You'll remain logged in after connecting your wallet</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Characters</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="text-left bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p className="text-xs font-mono">Email: {user?.email}</p>
            <p className="text-xs font-mono">Wallet: {walletAddress}</p>
            <p className="text-xs font-mono">User ID: {user?.sub}</p>
            <p className="text-xs font-mono">Has Access Token: {user?.accessToken ? 'Yes' : 'No'}</p>
            <p className="text-xs font-mono">Endpoint: /character/my-characters</p>
          </div>
          <button
            onClick={loadCharacters}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if ((characters?.characters?.length || 0) === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Characters Found</h2>
          <p className="text-muted-foreground mb-6">
            No characters are associated with your wallet address
          </p>
          <button
            onClick={() => navigate(ROUTES.CHARACTER_CREATE)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 mx-auto mb-6"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Character</span>
          </button>
          <div className="text-left bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-medium mb-2">Account Info:</h3>
            <p className="text-xs font-mono mb-1">Email: {user?.email}</p>
            <p className="text-xs font-mono mb-1">Wallet: {walletAddress}</p>
            <p className="text-xs font-mono mb-1">User ID: {user?.sub}</p>
            <p className="text-xs font-mono mb-1">Has Access Token: {user?.accessToken ? 'Yes' : 'No'}</p>
            <p className="text-xs font-mono">Request succeeded but no characters found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Characters</h1>
            <p className="text-muted-foreground">
              {characters?.characters?.length || 0} character{(characters?.characters?.length || 0) !== 1 ? 's' : ''} found for wallet:
              <span className="font-mono ml-1">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.CHARACTER_CREATE)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Character</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            // Extract the characters array from the response object
            const characterList = characters?.characters || [];
            return characterList.map((character) => {
            const ClassIcon = getClassIcon(character.class);

            return (
              <div
                key={character.id}
                onClick={() => navigate(`/character/${character.id}`)}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
              >
                {/* Character Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <ClassIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{character.name || 'Unnamed Character'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Level {character.level || 0} {character.class || 'Unknown Class'}
                    </p>
                  </div>
                  <div className={`text-sm ${getStatusColor(character.status)} capitalize`}>
                    {character.status?.replace('_', ' ') || 'Unknown'}
                  </div>
                </div>

                {/* Health & Mana Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Health</span>
                      <span>{character.health || 0}/{character.maxHealth || 0}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${((character.health || 0) / (character.maxHealth || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Mana</span>
                      <span>{character.mana || 0}/{character.maxMana || 0}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${((character.mana || 0) / (character.maxMana || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    World {character.position?.worldId || 'Unknown'} ({character.position?.x || 0}, {character.position?.y || 0}, {character.position?.z || 0})
                  </span>
                </div>

                {/* Experience Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Experience</span>
                    <span>{character.experience || 0} XP</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${((character.experience || 0) % 1000) / 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Last Active */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Last active: {character.lastActive ? formatLastActive(character.lastActive) : 'Unknown'}</span>
                  </div>
                  <span>ID: {character.id || 'Unknown'}</span>
                </div>
              </div>
            );
            });
          })()}
        </div>
      </div>
    </div>
  );
};