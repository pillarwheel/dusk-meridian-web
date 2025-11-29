import React, { useState } from 'react';
import { useCurrentCharacter, useCharacterSelector, useInventory } from '../../contexts/GameContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  Heart,
  Zap,
  Star,
  Coins,
  MapPin,
  Bell,
  ChevronDown,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

interface TopBarHUDProps {
  className?: string;
}

export const TopBarHUD: React.FC<TopBarHUDProps> = ({ className = '' }) => {
  const { character, isLoading, refresh } = useCurrentCharacter();
  const { currentCharacterId, characters, setCurrentCharacter } = useCharacterSelector();
  const { inventory } = useInventory();
  const { isConnected, connectionState } = useWebSocket();
  const [showCharacterDropdown, setShowCharacterDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Calculate percentages for progress bars
  const healthPercent = character ? (character.health / character.maxHealth) * 100 : 0;
  const manaPercent = character ? (character.mana / character.maxMana) * 100 : 0;

  // Calculate experience progress (assuming level system)
  const experiencePercent = character ? ((character.experiencePoints % 1000) / 1000) * 100 : 0;

  // Get gold from inventory
  const gold = inventory?.currency.find(c => c.currencyName.toLowerCase().includes('gold'))?.amount || 0;

  const getHealthColor = (percent: number) => {
    if (percent > 75) return 'bg-green-500';
    if (percent > 50) return 'bg-yellow-500';
    if (percent > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getManaColor = (percent: number) => {
    if (percent > 50) return 'bg-blue-500';
    if (percent > 25) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  if (isLoading && !character) {
    return (
      <div className={`bg-gray-900 border-b border-gray-700 px-4 py-2 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading character...</span>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={`bg-gray-900 border-b border-gray-700 px-4 py-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-gray-400">No character selected</div>
          {characters.length > 0 && (
            <button
              onClick={() => setCurrentCharacter(characters[0].characterId)}
              className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
            >
              Select Character
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border-b border-gray-700 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Left Section: Character Info */}
        <div className="flex items-center gap-4 flex-1">
          {/* Character Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCharacterDropdown(!showCharacterDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <User className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div className="text-sm font-semibold text-white">{character.name}</div>
                <div className="text-xs text-gray-400">
                  Level {character.level} {character.className}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Character Dropdown */}
            {showCharacterDropdown && characters.length > 1 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                <div className="p-2">
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-2 px-2">
                    Switch Character
                  </div>
                  {characters.map((char) => (
                    <button
                      key={char.characterId}
                      onClick={() => {
                        setCurrentCharacter(char.characterId);
                        setShowCharacterDropdown(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded transition-colors
                        ${char.characterId === currentCharacterId
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-700 text-gray-200'
                        }
                      `}
                    >
                      <div className="font-semibold text-sm">{char.name}</div>
                      <div className="text-xs opacity-75">
                        Level {char.level} {char.className}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Health Bar */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Health</span>
              <span className="text-xs font-semibold text-white ml-auto">
                {character.health} / {character.maxHealth}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getHealthColor(healthPercent)}`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Mana</span>
              <span className="text-xs font-semibold text-white ml-auto">
                {character.mana} / {character.maxMana}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getManaColor(manaPercent)}`}
                style={{ width: `${manaPercent}%` }}
              />
            </div>
          </div>

          {/* Experience Bar */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">XP</span>
              <span className="text-xs font-semibold text-white ml-auto">
                Level {character.level}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-300 bg-yellow-500"
                style={{ width: `${experiencePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Currency, Location, Status */}
        <div className="flex items-center gap-4">
          {/* Gold */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {gold.toLocaleString()}
            </span>
          </div>

          {/* Location */}
          {character.settlementId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                {character.settlementId}
              </span>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">Offline</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="w-4 h-4 text-gray-300" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                <div className="p-4">
                  <div className="text-sm font-semibold text-white mb-2">Notifications</div>
                  <div className="text-sm text-gray-400">No new notifications</div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Refresh character data"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showCharacterDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCharacterDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};
