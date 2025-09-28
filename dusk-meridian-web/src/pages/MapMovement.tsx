import React from 'react';
import { CharacterMapMovement } from '@/components/map/CharacterMapMovement';

const mockWorldMap: any = {
  id: 1,
  name: 'Aethermoor',
  width: 1000,
  height: 800,
  tiles: [], // Would be populated with actual tile data
  regions: [
    {
      id: 'region_1',
      name: 'Northern Wastes',
      bounds: { minX: 0, maxX: 500, minY: 0, maxY: 400 },
      controller: 'npc_faction_1',
      color: '#4A90E2',
      description: 'A harsh, frozen landscape dotted with ancient ruins',
      climate: 'polar',
      dangerLevel: 'high'
    },
    {
      id: 'region_2',
      name: 'Central Plains',
      bounds: { minX: 200, maxX: 800, minY: 200, maxY: 600 },
      controller: 'player_faction_1',
      color: '#7ED321',
      description: 'Fertile grasslands with scattered settlements',
      climate: 'temperate',
      dangerLevel: 'low'
    }
  ],
  settlements: [
    {
      id: 'settlement_1',
      name: 'Ironhold',
      position: { x: 245, y: 158 },
      faction: 'player',
      size: 'town',
      population: 2847,
      defenseLevel: 142,
      isVisible: true,
      isAccessible: true,
      lastUpdated: new Date()
    },
    {
      id: 'settlement_2',
      name: 'Frostpeak Outpost',
      position: { x: 120, y: 80 },
      faction: 'ally',
      size: 'outpost',
      population: 450,
      defenseLevel: 65,
      isVisible: true,
      isAccessible: true,
      lastUpdated: new Date()
    },
    {
      id: 'settlement_3',
      name: 'Goldmeadow',
      position: { x: 600, y: 400 },
      faction: 'neutral',
      size: 'city',
      population: 8200,
      defenseLevel: 380,
      isVisible: true,
      isAccessible: true,
      lastUpdated: new Date()
    }
  ],
  characters: [],
  pois: [
    {
      id: 'poi_1',
      name: 'Ancient Spire',
      type: 'ruins',
      position: { x: 180, y: 200 },
      description: 'A mysterious tower from a forgotten age',
      isDiscovered: true,
      danger: 'medium',
      icon: '🗼'
    },
    {
      id: 'poi_2',
      name: 'Crystal Cave',
      type: 'resource_node',
      position: { x: 750, y: 150 },
      description: 'A cave rich with magical crystals',
      isDiscovered: false,
      danger: 'high',
      icon: '💎'
    }
  ],
  boundaries: []
};

const mockCharacter: any = {
  id: 'char_001',
  name: 'Aria Shadowbane',
  position: { x: 245, y: 158 },
  movementSpeed: 15,
  isMoving: false,
  faction: 'player',
  isPlayer: true,
  isVisible: true,
  status: 'idle'
};

const mockMovementOrders: any[] = [
  {
    id: 'order_001',
    characterId: 'char_001',
    type: 'move',
    status: 'active',
    plan: {
      origin: { x: 245, y: 158 },
      destination: { x: 600, y: 400 },
      path: [
        { x: 245, y: 158 },
        { x: 400, y: 280 },
        { x: 600, y: 400 }
      ],
      estimatedTime: 180,
      totalDistance: 425.3,
      actionPointCost: 43,
      energyCost: 85,
      risks: [
        {
          type: 'weather',
          probability: 25,
          severity: 30,
          description: 'Light rain may slow travel by 10%'
        },
        {
          type: 'bandits',
          probability: 15,
          severity: 60,
          description: 'Bandit activity reported near central crossing'
        }
      ],
      waypoints: [
        {
          position: { x: 400, y: 280 },
          action: 'rest',
          duration: 15,
          description: 'Rest stop at Waypoint Inn'
        }
      ]
    },
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    estimatedArrival: new Date(Date.now() + 150 * 60 * 1000), // 150 minutes from now
    progress: 25,
    currentPosition: { x: 300, y: 200 },
    events: [
      {
        id: 'event_001',
        type: 'departure',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        position: { x: 245, y: 158 },
        description: 'Departed from Ironhold',
        effects: []
      }
    ]
  }
];

export const MapMovement: React.FC = () => {
  const handleCreateMovementOrder = (plan: any) => {
    console.log('Creating movement order:', plan);
    // In a real app, this would send the order to the server
  };

  const handleCancelOrder = (orderId: string) => {
    console.log('Cancelling order:', orderId);
  };

  const handlePauseOrder = (orderId: string) => {
    console.log('Pausing order:', orderId);
  };

  const handleResumeOrder = (orderId: string) => {
    console.log('Resuming order:', orderId);
  };

  return (
    <div className="h-screen overflow-hidden">
      <CharacterMapMovement
        worldMap={mockWorldMap}
        character={mockCharacter}
        movementOrders={mockMovementOrders}
        onCreateMovementOrder={handleCreateMovementOrder}
        onCancelOrder={handleCancelOrder}
        onPauseOrder={handlePauseOrder}
        onResumeOrder={handleResumeOrder}
      />
    </div>
  );
};