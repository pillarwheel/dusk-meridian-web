import React, { useState } from 'react';
import { useCharacterSelector } from '../../contexts/GameContext';
import { User, ChevronDown, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface CharacterSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const CharacterSwitcher: React.FC<CharacterSwitcherProps> = ({
  className = '',
  compact = false,
}) => {
  const { currentCharacterId, characters, setCurrentCharacter } = useCharacterSelector();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const currentCharacter = characters.find(c => c.characterId === currentCharacterId);

  const handleCharacterSelect = (characterId: string) => {
    setCurrentCharacter(characterId);
    setShowDropdown(false);
  };

  const handleCreateCharacter = () => {
    setShowDropdown(false);
    navigate(ROUTES.CHARACTER_CREATE);
  };

  if (characters.length === 0) {
    return (
      <div className={`${className}`}>
        <button
          onClick={handleCreateCharacter}
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Character</span>
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <User className="w-4 h-4 text-blue-400" />
          {currentCharacter && (
            <span className="text-sm font-semibold text-white">
              {currentCharacter.name}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
              <div className="p-2">
                {characters.map((char) => (
                  <button
                    key={char.characterId}
                    onClick={() => handleCharacterSelect(char.characterId)}
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
                <div className="border-t border-gray-700 my-2" />
                <button
                  onClick={handleCreateCharacter}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create New Character</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          👤 Characters
          <span className="text-sm font-normal text-gray-400">
            ({characters.length})
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-2">
        {characters.map((char) => (
          <div
            key={char.characterId}
            onClick={() => handleCharacterSelect(char.characterId)}
            className={`
              p-3 rounded-lg border-2 cursor-pointer transition-all
              ${char.characterId === currentCharacterId
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white">{char.name}</h4>
                  {char.characterId === currentCharacterId && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Level {char.level} {char.className}
                </div>

                {/* Health/Mana Bars */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">HP</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${(char.health / char.maxHealth) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {char.health}/{char.maxHealth}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">MP</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(char.mana / char.maxMana) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {char.mana}/{char.maxMana}
                    </span>
                  </div>
                </div>

                {/* Location */}
                {char.settlementId && (
                  <div className="mt-2 text-xs text-gray-500">
                    📍 {char.settlementId}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create New Character Button */}
        <button
          onClick={handleCreateCharacter}
          className="w-full p-3 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Character</span>
        </button>
      </div>
    </div>
  );
};
