/**
 * Sprite Factory - Creates optimized PIXI Graphics for buildings and characters
 * Uses vector graphics instead of bitmap textures for smaller memory footprint
 */

import * as PIXI from 'pixi.js';
import type { MapBuilding, MapCharacter } from '@/types/map';

// Building type color mapping
const BUILDING_TYPE_COLORS: Record<string, number> = {
  Residential: 0x10b981,    // Green
  Commercial: 0xf59e0b,     // Amber
  Industrial: 0x6b7280,     // Gray
  Military: 0xef4444,       // Red
  Administrative: 0x8b5cf6, // Purple
  Religious: 0xec4899,      // Pink
  Storage: 0x06b6d4,        // Cyan
};

const DEFAULT_BUILDING_COLOR = 0x6b7280;

/**
 * Create a building sprite with status indicators
 */
export function createBuildingSprite(building: MapBuilding): PIXI.Graphics {
  const graphics = new PIXI.Graphics();
  const size = 24;
  const halfSize = size / 2;

  // Get building color based on type
  const color = BUILDING_TYPE_COLORS[building.type] || DEFAULT_BUILDING_COLOR;

  // Draw main building rectangle (updated for PixiJS v8)
  graphics.roundRect(-halfSize, -halfSize, size, size, 2);
  graphics.fill({ color });
  graphics.stroke({ color: 0xffffff, width: 2 });

  // Draw status indicator
  if (building.isDestroyed) {
    // X mark for destroyed
    graphics.moveTo(-6, -6);
    graphics.lineTo(6, 6);
    graphics.moveTo(6, -6);
    graphics.lineTo(-6, 6);
    graphics.stroke({ color: 0xffffff, width: 2 });
  } else if (building.isDamaged) {
    // Exclamation mark for damaged
    graphics.circle(0, 3, 1.5);
    graphics.fill({ color: 0xffffff });
    graphics.moveTo(0, -6);
    graphics.lineTo(0, 0);
    graphics.stroke({ color: 0xffffff, width: 2 });
  } else if (building.isActive) {
    // Checkmark for active
    graphics.moveTo(-6, 0);
    graphics.lineTo(-2, 4);
    graphics.lineTo(6, -4);
    graphics.stroke({ color: 0xffffff, width: 2 });
  } else {
    // Circle for inactive
    graphics.circle(0, 0, 4);
    graphics.stroke({ color: 0xffffff, width: 2 });
  }

  // Set position
  graphics.position.set(building.xCoordinate, building.zCoordinate);

  // Make interactive
  graphics.eventMode = 'static';
  graphics.cursor = 'pointer';

  // Store building data for click handlers
  (graphics as any).buildingData = building;

  return graphics;
}

/**
 * Create a character sprite with player/NPC indicator
 */
export function createCharacterSprite(character: MapCharacter): PIXI.Graphics {
  const graphics = new PIXI.Graphics();
  const size = 16;

  // Color based on player vs NPC
  const color = character.isPlayer ? 0x3b82f6 : 0xf59e0b; // Blue for player, amber for NPC

  // Draw outer circle (updated for PixiJS v8)
  graphics.circle(0, 0, size / 2);
  graphics.fill({ color });
  graphics.stroke({ color: 0xffffff, width: 2 });

  // Draw inner circle
  graphics.circle(0, 0, 3);
  graphics.fill({ color: 0xffffff });

  // Set position - use zCoordinate for Y axis in map space
  graphics.position.set(
    character.xCoordinate,
    character.zCoordinate || character.yCoordinate
  );

  // Make interactive
  graphics.eventMode = 'static';
  graphics.cursor = 'pointer';

  // Store character data for click handlers
  (graphics as any).characterData = character;

  return graphics;
}

/**
 * Update existing character sprite position (for animations)
 */
export function updateCharacterSpritePosition(
  sprite: PIXI.Graphics,
  x: number,
  y: number
): void {
  sprite.position.set(x, y);
}

/**
 * Create a simple background texture
 */
export function createBackgroundTexture(
  width: number,
  height: number,
  color: number = 0x4ade80
): PIXI.Graphics {
  const background = new PIXI.Graphics();
  background.rect(0, 0, width, height);
  background.fill({ color });
  return background;
}

/**
 * Create health bar overlay for characters
 */
export function createHealthBar(
  currentHealth: number,
  maxHealth: number,
  width: number = 20
): PIXI.Graphics {
  const graphics = new PIXI.Graphics();
  const height = 4;
  const healthPercent = currentHealth / maxHealth;

  // Background (red)
  graphics.rect(-width / 2, -12, width, height);
  graphics.fill({ color: 0xef4444 });

  // Foreground (green)
  graphics.rect(-width / 2, -12, width * healthPercent, height);
  graphics.fill({ color: 0x10b981 });

  return graphics;
}

/**
 * Create text label for hover tooltips
 */
export function createLabel(text: string, style?: Partial<PIXI.TextStyle>): PIXI.Text {
  const defaultStyle = new PIXI.TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fill: 0xffffff,
    stroke: 0x000000,
    strokeThickness: 3,
    dropShadow: true,
    dropShadowColor: 0x000000,
    dropShadowBlur: 4,
    dropShadowDistance: 2,
    ...style,
  });

  return new PIXI.Text(text, defaultStyle);
}

/**
 * Calculate bounds for a set of objects
 */
export function calculateBounds(objects: Array<{ x: number; y: number }>) {
  if (objects.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  objects.forEach((obj) => {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x);
    maxY = Math.max(maxY, obj.y);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
