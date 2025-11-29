import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SettlementView } from '@/components/settlement/SettlementView';
import { settlementApi } from '@/api/endpoints/settlement';
import { QUERY_KEYS } from '@/utils/constants';

const mockSettlement: any = {
  id: 'settlement_001',
  name: 'Ironhold',
  faction: 'player',
  population: {
    current: 2847,
    max: 3500,
    growth: 12,
    happiness: 78,
    loyalty: 85
  },
  defense: {
    rating: 142,
    walls: {
      level: 3,
      health: 2400,
      maxHealth: 2500,
      material: 'stone'
    },
    towers: 4,
    gates: [
      {
        id: 'gate_north',
        name: 'North Gate',
        direction: 'north',
        health: 800,
        maxHealth: 1000,
        isOpen: true,
        guardStrength: 25
      }
    ],
    traps: []
  },
  resources: {
    storage: {
      food: { current: 1250, max: 2000, reserved: 100 },
      wood: { current: 800, max: 1500, reserved: 200 },
      stone: { current: 600, max: 1200, reserved: 150 },
      iron: { current: 300, max: 800, reserved: 50 },
      gold: { current: 15000, max: 50000, reserved: 2000 },
      gems: { current: 45, max: 100, reserved: 5 },
      mana: { current: 120, max: 200, reserved: 20 }
    },
    production: {
      food: { rate: 25, efficiency: 85, workers: 120, maxWorkers: 150 },
      wood: { rate: 18, efficiency: 90, workers: 80, maxWorkers: 100 },
      stone: { rate: 12, efficiency: 75, workers: 60, maxWorkers: 80 },
      iron: { rate: 8, efficiency: 80, workers: 40, maxWorkers: 50 },
      gold: { rate: 5, efficiency: 70, workers: 25, maxWorkers: 30 },
      gems: { rate: 1, efficiency: 60, workers: 10, maxWorkers: 15 },
      mana: { rate: 3, efficiency: 85, workers: 15, maxWorkers: 20 }
    },
    consumption: {
      food: 20,
      wood: 5,
      stone: 2,
      iron: 1,
      gold: 8,
      mana: 2
    }
  },
  buildings: [
    {
      id: 'building_001',
      type: 'town_hall',
      name: 'Town Hall',
      level: 4,
      maxLevel: 5,
      health: 1800,
      maxHealth: 2000,
      position: { x: 50, y: 50, width: 4, height: 4 },
      status: 'active',
      queue: [
        {
          id: 'queue_001',
          action: 'upgrade',
          target: 'Town Hall',
          progress: 65,
          timeRemaining: 180,
          cost: { gold: 5000, wood: 200, stone: 300 },
          priority: 1
        }
      ],
      resources: {
        input: {},
        output: {},
        storage: {}
      },
      workers: { current: 12, max: 15, efficiency: 90, wages: 10 },
      upgradeCost: {
        gold: 8000,
        wood: 300,
        stone: 500,
        iron: 100,
        time: 8,
        requirements: []
      },
      description: 'The administrative center of the settlement',
      abilities: [],
      lastMaintenance: new Date('2024-01-01')
    },
    {
      id: 'building_002',
      type: 'barracks',
      name: 'Barracks',
      level: 3,
      maxLevel: 5,
      health: 1200,
      maxHealth: 1200,
      position: { x: 20, y: 30, width: 3, height: 3 },
      status: 'active',
      queue: [
        {
          id: 'queue_002',
          action: 'train',
          target: 'Guards',
          progress: 25,
          timeRemaining: 120,
          cost: { gold: 500, food: 50 },
          priority: 2
        }
      ],
      resources: {
        input: { food: { current: 100, max: 200, reserved: 50 } },
        output: {},
        storage: {}
      },
      workers: { current: 8, max: 10, efficiency: 85, wages: 15 },
      description: 'Training facility for military units',
      abilities: [],
      lastMaintenance: new Date('2024-01-01')
    },
    {
      id: 'building_003',
      type: 'market',
      name: 'Marketplace',
      level: 2,
      maxLevel: 4,
      health: 800,
      maxHealth: 800,
      position: { x: 70, y: 40, width: 3, height: 2 },
      status: 'active',
      queue: [],
      resources: {
        input: {},
        output: { gold: { rate: 15, efficiency: 75, workers: 20, maxWorkers: 25 } },
        storage: {}
      },
      workers: { current: 20, max: 25, efficiency: 75, wages: 8 },
      upgradeCost: {
        gold: 3000,
        wood: 150,
        stone: 100,
        iron: 50,
        time: 4,
        requirements: []
      },
      description: 'Trading center for goods and services',
      abilities: [],
      lastMaintenance: new Date('2024-01-01')
    },
    {
      id: 'building_004',
      type: 'farm',
      name: 'Wheat Farm',
      level: 2,
      maxLevel: 3,
      health: 600,
      maxHealth: 600,
      position: { x: 10, y: 80, width: 4, height: 3 },
      status: 'active',
      queue: [],
      resources: {
        input: {},
        output: { food: { rate: 12, efficiency: 90, workers: 25, maxWorkers: 30 } },
        storage: { food: { current: 200, max: 300, reserved: 0 } }
      },
      workers: { current: 25, max: 30, efficiency: 90, wages: 5 },
      description: 'Produces food for the settlement',
      abilities: [],
      lastMaintenance: new Date('2024-01-01')
    },
    {
      id: 'building_005',
      type: 'workshop',
      name: 'Blacksmith',
      level: 3,
      maxLevel: 4,
      health: 900,
      maxHealth: 1000,
      position: { x: 60, y: 20, width: 2, height: 2 },
      status: 'active',
      queue: [
        {
          id: 'queue_003',
          action: 'craft',
          target: 'Iron Sword',
          progress: 80,
          timeRemaining: 45,
          cost: { iron: 10, gold: 100 },
          priority: 1
        }
      ],
      resources: {
        input: { iron: { current: 50, max: 100, reserved: 10 }, wood: { current: 30, max: 50, reserved: 5 } },
        output: {},
        storage: {}
      },
      workers: { current: 6, max: 8, efficiency: 95, wages: 12 },
      description: 'Crafts weapons and tools',
      abilities: [],
      lastMaintenance: new Date('2024-01-01')
    }
  ],
  garrison: {
    commander: 'Captain Marcus',
    units: [
      {
        id: 'unit_001',
        type: 'Guards',
        count: 25,
        level: 2,
        health: 95,
        experience: 450,
        equipment: ['Iron Sword', 'Leather Armor']
      }
    ],
    capacity: 100,
    morale: 80,
    training: [],
    patrol: []
  },
  location: {
    x: 245,
    y: 158,
    z: 12,
    regionName: 'Northern Wastes'
  },
  status: 'peaceful',
  owner: 'player_001',
  founded: new Date('2023-06-15'),
  lastUpdated: new Date()
};

export const Settlement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const settlementId = id ? parseInt(id, 10) : 0;

  const { data: settlement, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.SETTLEMENT(settlementId),
    queryFn: () => settlementApi.getSettlement(settlementId),
    enabled: !!settlementId
  });

  const { data: population } = useQuery({
    queryKey: QUERY_KEYS.SETTLEMENT_POPULATION(settlementId),
    queryFn: () => settlementApi.getSettlementPopulation(settlementId),
    enabled: !!settlementId
  });

  const { data: buildings } = useQuery({
    queryKey: QUERY_KEYS.SETTLEMENT_BUILDINGS(settlementId),
    queryFn: () => settlementApi.getSettlementBuildings(settlementId),
    enabled: !!settlementId
  });

  const handleEnterBuilding = (building: any) => {
    console.log('Entering building:', building.name);
  };

  const handleManageGarrison = () => {
    console.log('Managing garrison');
  };

  const handleTrade = () => {
    console.log('Opening trade interface');
  };

  const handleRecruitUnits = () => {
    console.log('Opening recruitment interface');
  };

  const handleViewMap = () => {
    console.log('Opening settlement map');
  };

  if (!settlementId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Settlement</h2>
          <button
            onClick={() => navigate('/settlements')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Settlements
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Settlement</h2>
          <p className="mb-4">Failed to load settlement data. Please try again later.</p>
          <button
            onClick={() => navigate('/settlements')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Settlements
          </button>
        </div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Settlement Not Found</h2>
          <p className="mb-4">The requested settlement could not be found.</p>
          <button
            onClick={() => navigate('/settlements')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Settlements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <button
          onClick={() => navigate('/settlements')}
          className="text-blue-500 hover:text-blue-700 mb-4"
        >
          ← Back to Settlements
        </button>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{settlement.name}</h1>
            <p className="text-gray-600">Settlement ID: {settlementId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Population</h3>
            <p className="text-2xl font-bold text-gray-900">
              {population?.total?.toLocaleString() || 'Loading...'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Buildings</h3>
            <p className="text-2xl font-bold text-gray-900">
              {buildings?.length || 'Loading...'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </div>
        </div>
      </div>

      {/* Population Section */}
      {population && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Population ({population.total})</h2>

          {/* Characters in Buildings */}
          {population.byBuilding && population.byBuilding.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">In Buildings</h3>
              {population.byBuilding.map((buildingGroup) => (
                <div key={buildingGroup.buildingId} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {buildingGroup.buildingName} ({buildingGroup.characters.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                    {buildingGroup.characters.map((character) => (
                      <div key={character.characterId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h5 className="font-medium text-gray-900">{character.name}</h5>
                        <p className="text-sm text-gray-600">Level {character.level} {character.class}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Characters Outside */}
          {population.outdoor && population.outdoor.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Outside ({population.outdoor.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {population.outdoor.map((character) => (
                  <div key={character.characterId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h5 className="font-medium text-gray-900">{character.name}</h5>
                    <p className="text-sm text-gray-600">Level {character.level} {character.class}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!population.byBuilding || population.byBuilding.length === 0) &&
           (!population.outdoor || population.outdoor.length === 0) && (
            <p className="text-gray-500 italic">No characters in this settlement</p>
          )}
        </div>
      )}

      {/* Buildings Section */}
      {buildings && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Buildings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map((building) => {
              console.log('🏗️ Building data:', building);
              return (
              <div key={building.settlementBuildingId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{building.name || building.prefabName || `Building Template ${building.buildingId}`}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    building.isActive && !building.isDestroyed && !building.isDamaged
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {building.isDestroyed ? 'Destroyed' :
                     building.isDamaged ? 'Damaged' :
                     building.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Type: {building.type}</p>
                <p className="text-sm text-gray-600">Prefab: {building.prefabName || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Position: ({building.xCoordinate}, {building.yCoordinate}, {building.zCoordinate})
                </p>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Placeholder sections for Production and Overview as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Production</h2>
          <p className="text-gray-600">Production data will be implemented here.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600">Additional overview data will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};