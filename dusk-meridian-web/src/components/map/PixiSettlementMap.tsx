import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Building, Users, Hammer, Coins } from 'lucide-react';
import type { MapBuilding, MapCharacter } from '@/types/map';
import { SpatialGrid } from '@/utils/spatialGrid';
import {
  createBuildingSprite,
  createCharacterSprite,
  calculateBounds,
  createBackgroundTexture,
} from '@/utils/spriteFactory';

interface PixiSettlementMapProps {
  settlementId: number;
  settlementName: string;
  buildings: MapBuilding[];
  characters: MapCharacter[];
  onBuildingSelect?: (building: MapBuilding) => void;
  onRefresh?: () => void;
}

interface CharacterSpriteData {
  sprite: PIXI.Graphics;
  character: MapCharacter;
  animation?: gsap.core.Tween;
}

export const PixiSettlementMap: React.FC<PixiSettlementMapProps> = ({
  settlementId,
  settlementName,
  buildings,
  characters,
  onBuildingSelect,
  onRefresh,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const buildingLayerRef = useRef<PIXI.Container | null>(null);
  const characterLayerRef = useRef<PIXI.Container | null>(null);
  const uiLayerRef = useRef<PIXI.Container | null>(null);
  const spatialGridRef = useRef<SpatialGrid<any> | null>(null);
  const characterSpritesRef = useRef<Map<number, CharacterSpriteData>>(new Map());

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [showCharacters, setShowCharacters] = useState(true);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [showResourceFlow, setShowResourceFlow] = useState(false);
  const [isPixiReady, setIsPixiReady] = useState(false);

  const MAX_RENDERED_CHARACTERS = 5000; // Limit for performance
  const characterCount = characters.length;
  const renderedCharacters = showCharacters ? characters.slice(0, MAX_RENDERED_CHARACTERS) : [];
  const hasMoreCharacters = characterCount > MAX_RENDERED_CHARACTERS;

  // Initialize PIXI Application
  useEffect(() => {
    console.log('🔄 PixiJS initialization useEffect triggered', {
      hasCanvas: !!canvasRef.current,
      hasApp: !!appRef.current,
    });

    if (!canvasRef.current) {
      console.warn('⚠️ Canvas ref not available, will retry on next render');
      return;
    }

    if (appRef.current) {
      console.log('✅ PixiJS already initialized, skipping');
      return;
    }

    const initPixi = async () => {
      try {
        console.log('🎨 Starting PixiJS initialization...');

        // Check canvas dimensions
        const width = canvasRef.current!.clientWidth;
        const height = canvasRef.current!.clientHeight;
        console.log('📏 Canvas dimensions:', { width, height });

        if (width === 0 || height === 0) {
          console.warn('⚠️ Canvas has zero dimensions, retrying in 100ms...');
          setTimeout(initPixi, 100);
          return;
        }

        console.log('✅ Canvas has valid dimensions, proceeding with initialization');

        // Create PIXI application
        const app = new PIXI.Application();
        console.log('📦 PIXI.Application instance created');

        await app.init({
          width,
          height,
          backgroundColor: 0x4ade80, // Green background
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          antialias: true,
        });
        console.log('✅ PIXI app initialized', { width: app.screen.width, height: app.screen.height });

        // Add canvas to DOM
        if (!canvasRef.current) {
          console.error('❌ Canvas ref lost during initialization');
          return;
        }

        canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
        console.log('✅ Canvas added to DOM');

        appRef.current = app;
        console.log('✅ App stored in ref');

        // Create layers (z-index matters!)
        const backgroundLayer = new PIXI.Container();
        const buildingLayer = new PIXI.Container();
        const characterLayer = new PIXI.Container();
        const uiLayer = new PIXI.Container();

        backgroundLayer.label = 'background';
        buildingLayer.label = 'buildings';
        characterLayer.label = 'characters';
        uiLayer.label = 'ui';

        app.stage.addChild(backgroundLayer);
        app.stage.addChild(buildingLayer);
        app.stage.addChild(characterLayer);
        app.stage.addChild(uiLayer);

        buildingLayerRef.current = buildingLayer;
        characterLayerRef.current = characterLayer;
        uiLayerRef.current = uiLayer;

        // Initialize spatial grid for viewport culling
        spatialGridRef.current = new SpatialGrid(64); // 64-pixel cells

        // Don't create background here - we'll create it dynamically after buildings load
        backgroundLayer.label = 'background';

        // Enable interactivity
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;

        // Add pan and zoom controls
        setupViewportControls(app);

        console.log('✅✅✅ PixiJS FULLY INITIALIZED AND READY ✅✅✅');
        console.log('🎯 WebGL Renderer:', app.renderer.type === PIXI.RendererType.WEBGL ? 'Yes' : 'No');
        console.log('📊 Canvas size:', { width: app.screen.width, height: app.screen.height });
        console.log('🎨 Layers created:', {
          background: !!backgroundLayer,
          buildings: !!buildingLayerRef.current,
          characters: !!characterLayerRef.current,
          ui: !!uiLayerRef.current,
        });

        // Mark PixiJS as ready
        setIsPixiReady(true);
        console.log('🚀 isPixiReady set to TRUE - data loading can begin');
      } catch (err) {
        console.error('❌ FAILED to initialize PixiJS:', err);
        setError('Failed to initialize map renderer');
      }
    };

    initPixi();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        console.log('🧹 Cleaning up PixiJS application');
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      // Reset ready state on cleanup (important for React Strict Mode)
      setIsPixiReady(false);
      buildingLayerRef.current = null;
      characterLayerRef.current = null;
      uiLayerRef.current = null;
      spatialGridRef.current = null;
    };
  }, []);

  // Setup viewport controls (pan and zoom)
  const setupViewportControls = (app: PIXI.Application) => {
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    // Pan with mouse drag
    app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      isDragging = true;
      dragStart = { x: event.global.x, y: event.global.y };
    });

    app.stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (isDragging) {
        const dx = event.global.x - dragStart.x;
        const dy = event.global.y - dragStart.y;

        app.stage.position.x += dx;
        app.stage.position.y += dy;

        dragStart = { x: event.global.x, y: event.global.y };

        setViewport((prev) => ({
          ...prev,
          x: app.stage.position.x,
          y: app.stage.position.y,
        }));
      }
    });

    app.stage.on('pointerup', () => {
      isDragging = false;
    });

    app.stage.on('pointerupoutside', () => {
      isDragging = false;
    });

    // Zoom with mouse wheel
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault();

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.25, Math.min(4, app.stage.scale.x * zoomFactor));

      // Zoom towards mouse position
      const mousePos = { x: event.offsetX, y: event.offsetY };
      const worldPos = {
        x: (mousePos.x - app.stage.position.x) / app.stage.scale.x,
        y: (mousePos.y - app.stage.position.y) / app.stage.scale.y,
      };

      app.stage.scale.set(newScale);

      app.stage.position.x = mousePos.x - worldPos.x * newScale;
      app.stage.position.y = mousePos.y - worldPos.y * newScale;

      setViewport({
        x: app.stage.position.x,
        y: app.stage.position.y,
        scale: newScale,
      });
    });
  };

  // Data is now provided via props - no internal loading needed

  // Create background sized to actual content
  const createDynamicBackground = (buildings: MapBuilding[]) => {
    if (!appRef.current) return;

    const app = appRef.current;
    const backgroundLayer = app.stage.getChildAt(0) as PIXI.Container;

    // Clear old background
    backgroundLayer.removeChildren();

    if (buildings.length === 0) {
      // Fallback small background
      const bg = createBackgroundTexture(500, 500, 0x4ade80);
      bg.position.set(-250, -250);
      backgroundLayer.addChild(bg);
      return;
    }

    // Calculate actual bounds
    const positions = buildings.map(b => ({ x: b.xCoordinate, y: b.zCoordinate }));
    const bounds = calculateBounds(positions);

    // Add generous padding
    const padding = 200;
    const bgWidth = bounds.width + padding * 2;
    const bgHeight = bounds.height + padding * 2;

    console.log('📐 Creating dynamic background:', {
      width: bgWidth,
      height: bgHeight,
      bounds,
      buildingCount: buildings.length
    });

    // Create properly sized background
    const bg = createBackgroundTexture(bgWidth, bgHeight, 0x4ade80);
    bg.position.set(bounds.minX - padding, bounds.minY - padding);
    backgroundLayer.addChild(bg);
  };

  // Render buildings (static layer - renders once)
  useEffect(() => {
    if (!buildingLayerRef.current || !spatialGridRef.current || !appRef.current) {
      console.log('⏸️ Building render skipped: refs not ready');
      return;
    }

    if (buildings.length === 0) {
      console.log('⏸️ Building render skipped: no buildings loaded');
      return;
    }

    console.log('🏗️ Rendering buildings layer...', { buildingCount: buildings.length });
    const startTime = performance.now();

    const buildingLayer = buildingLayerRef.current;

    // Clear existing buildings
    buildingLayer.removeChildren();

    // Filter placed buildings
    const placedBuildings = buildings.filter(
      (b) => !(b.xCoordinate === 0 && b.yCoordinate === 0 && b.zCoordinate === 0)
    );

    console.log(`📍 Found ${placedBuildings.length} placed buildings out of ${buildings.length} total`);

    if (placedBuildings.length === 0) {
      console.log('⚠️ No placed buildings to render (all at origin 0,0,0)');
      return;
    }

    // FIRST: Create dynamic background sized to buildings
    createDynamicBackground(placedBuildings);

    // Rebuild spatial grid
    const gridObjects = placedBuildings.map((b) => ({
      id: b.buildingId,
      x: b.xCoordinate,
      y: b.zCoordinate,
      data: b,
    }));
    spatialGridRef.current.rebuild(gridObjects);

    // Create building sprites
    placedBuildings.forEach((building) => {
      const sprite = createBuildingSprite(building);

      // Add click handler
      sprite.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
        event.stopPropagation();
        console.log('🏢 Building clicked:', building.name);
        setSelectedEntity({
          type: 'building',
          id: building.buildingId,
          data: building,
        });
        if (onBuildingSelect) {
          onBuildingSelect(building);
        }
      });

      buildingLayer.addChild(sprite);
    });

    const renderTime = performance.now() - startTime;
    console.log(`✅ Buildings rendered in ${renderTime.toFixed(2)}ms`);
    console.log('📊 Spatial grid stats:', spatialGridRef.current.getStats());

    // LAST: Fit camera after buildings are rendered
    // Use requestAnimationFrame to ensure render is complete
    requestAnimationFrame(() => {
      fitCameraToBuildings(placedBuildings);
    });
  }, [buildings, onBuildingSelect]);

  // Render characters (dynamic layer with GSAP animations)
  useEffect(() => {
    if (!characterLayerRef.current) return;
    if (!showCharacters || renderedCharacters.length === 0) {
      characterLayerRef.current.removeChildren();
      characterSpritesRef.current.clear();
      return;
    }

    console.log(`👥 Updating characters layer... (${renderedCharacters.length}/${characterCount} rendered)`);
    const characterLayer = characterLayerRef.current;
    const existingSprites = characterSpritesRef.current;

    // Track which characters still exist
    const currentCharacterIds = new Set(renderedCharacters.map((c) => c.characterId));

    // Remove characters that no longer exist (with fade out animation)
    existingSprites.forEach((spriteData, characterId) => {
      if (!currentCharacterIds.has(characterId)) {
        gsap.to(spriteData.sprite, {
          alpha: 0,
          duration: 0.5,
          onComplete: () => {
            characterLayer.removeChild(spriteData.sprite);
            spriteData.sprite.destroy();
            existingSprites.delete(characterId);
          },
        });
      }
    });

    // Update or create character sprites
    renderedCharacters.forEach((character) => {
      const existingData = existingSprites.get(character.characterId);

      if (existingData) {
        // Update existing character position with smooth animation
        const newX = character.xCoordinate;
        const newY = character.zCoordinate || character.yCoordinate;

        // Check if position actually changed
        const posChanged =
          existingData.sprite.position.x !== newX ||
          existingData.sprite.position.y !== newY;

        if (posChanged) {
          console.log(`🚶 Character ${character.name} moving:`, {
            from: { x: existingData.sprite.position.x, y: existingData.sprite.position.y },
            to: { x: newX, y: newY }
          });

          // Animate position change
          if (existingData.animation) {
            existingData.animation.kill();
          }

          existingData.animation = gsap.to(existingData.sprite.position, {
            x: newX,
            y: newY,
            duration: 2,
            ease: 'power2.inOut',
          });
        }

        // Update stored data
        existingData.character = character;
      } else {
        // Create new character sprite
        const sprite = createCharacterSprite(character);

        // Start invisible and fade in
        sprite.alpha = 0;
        gsap.to(sprite, {
          alpha: 1,
          duration: 0.5,
          ease: 'back.out',
        });

        // Add click handler
        sprite.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
          event.stopPropagation();
          console.log('👤 Character clicked:', character.name);
          setSelectedEntity({
            type: 'character',
            id: character.characterId,
            data: character,
          });
        });

        characterLayer.addChild(sprite);
        existingSprites.set(character.characterId, { sprite, character });
      }
    });

    console.log(`✅ Characters updated: ${renderedCharacters.length} rendered, ${characterCount} total`);
  }, [renderedCharacters, characterCount, showCharacters]);

  // Fit camera to buildings on initial load
  const fitCameraToBuildings = (buildings: MapBuilding[]) => {
    if (!appRef.current || buildings.length === 0) {
      console.log('⚠️ Cannot fit camera: app or buildings missing');
      return;
    }

    const positions = buildings.map((b) => ({
      x: b.xCoordinate,
      y: b.zCoordinate,
    }));

    const bounds = calculateBounds(positions);

    // Validate bounds
    if (bounds.width === 0 || bounds.height === 0) {
      console.warn('⚠️ Invalid bounds:', bounds);
      return;
    }

    const padding = 100;

    const app = appRef.current;
    const viewWidth = app.screen.width;
    const viewHeight = app.screen.height;

    // Calculate scale to fit all buildings with safety limits
    const scaleX = viewWidth / (bounds.width + padding * 2);
    const scaleY = viewHeight / (bounds.height + padding * 2);
    // Use the SMALLER scale to ensure both dimensions fit in viewport
    const fitScale = Math.min(scaleX, scaleY);
    // Clamp between 0.1x and 2x
    const scale = Math.max(0.1, Math.min(fitScale, 2));

    // Center on buildings
    const centerX = bounds.minX + bounds.width / 2;
    const centerY = bounds.minY + bounds.height / 2;

    console.log('📷 Fitting camera:', {
      bounds,
      scaleX,
      scaleY,
      fitScale,
      finalScale: scale,
      center: { x: centerX, y: centerY },
      viewSize: { width: viewWidth, height: viewHeight }
    });

    app.stage.scale.set(scale);
    app.stage.position.set(
      viewWidth / 2 - centerX * scale,
      viewHeight / 2 - centerY * scale
    );

    setViewport({
      x: app.stage.position.x,
      y: app.stage.position.y,
      scale,
    });

    console.log('✅ Camera fitted successfully');
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current && canvasRef.current) {
        appRef.current.renderer.resize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard controls for map navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!appRef.current) return;

      const app = appRef.current;
      const panSpeed = 50;
      const zoomSpeed = 0.1;

      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          app.stage.position.y += panSpeed;
          break;
        case 's':
        case 'arrowdown':
          app.stage.position.y -= panSpeed;
          break;
        case 'a':
        case 'arrowleft':
          app.stage.position.x += panSpeed;
          break;
        case 'd':
        case 'arrowright':
          app.stage.position.x -= panSpeed;
          break;
        case '+':
        case '=':
          const newScaleUp = Math.min(app.stage.scale.x + zoomSpeed, 4);
          app.stage.scale.set(newScaleUp);
          break;
        case '-':
        case '_':
          const newScaleDown = Math.max(app.stage.scale.x - zoomSpeed, 0.25);
          app.stage.scale.set(newScaleDown);
          break;
        case 'r':
          // Reset camera to fit buildings
          if (buildings.length > 0) {
            const placedBuildings = buildings.filter(
              (b) => !(b.xCoordinate === 0 && b.yCoordinate === 0 && b.zCoordinate === 0)
            );
            fitCameraToBuildings(placedBuildings);
          }
          break;
        default:
          return;
      }

      setViewport({
        x: app.stage.position.x,
        y: app.stage.position.y,
        scale: app.stage.scale.x,
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [buildings]);

  // Check if we have placed buildings
  const placedBuildings = buildings.filter(
    (b) => !(b.xCoordinate === 0 && b.yCoordinate === 0 && b.zCoordinate === 0)
  );

  return (
    <div className="h-full relative">
      {/* No Buildings Overlay */}
      {placedBuildings.length === 0 && buildings.length === 0 && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background">
          <div className="text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No buildings found in this settlement</p>
          </div>
        </div>
      )}

      {/* Unplaced Buildings Overlay */}
      {placedBuildings.length === 0 && buildings.length > 0 && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background">
          <div className="text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium mb-2">
              {buildings.length} buildings found but not placed yet
            </p>
            <p className="text-sm text-muted-foreground">
              Buildings are at coordinates (0,0,0) and need to be positioned in the game world
            </p>
          </div>
        </div>
      )}

      {/* PixiJS Canvas - Always rendered so ref can attach */}
      <div ref={canvasRef} className="h-full w-full" />

      {/* Character Limit Warning */}
      {hasMoreCharacters && showCharacters && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-4 py-2 rounded-lg shadow-lg z-[1001] flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            Showing {MAX_RENDERED_CHARACTERS.toLocaleString()} of {characterCount.toLocaleString()} characters for performance
          </span>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000] space-y-2">
        <button
          onClick={() => setGridOverlay(!gridOverlay)}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            gridOverlay ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Hammer className="w-4 h-4" />
          Grid
        </button>
        <button
          onClick={() => setShowCharacters(!showCharacters)}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            showCharacters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Users className="w-4 h-4" />
          Characters
        </button>
        <button
          onClick={() => setShowResourceFlow(!showResourceFlow)}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            showResourceFlow ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Coins className="w-4 h-4" />
          Resources
        </button>
      </div>

      {/* Building Legend */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">Building Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Residential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Military</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Administrative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Industrial</span>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">{settlementName}</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Buildings:</span>
            <span className="font-medium">{placedBuildings.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Active:</span>
            <span className="font-medium text-green-500">
              {buildings.filter((b) => b.isActive).length}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Characters:</span>
            <span className={`font-medium ${hasMoreCharacters ? 'text-yellow-500' : 'text-blue-500'}`}>
              {hasMoreCharacters ? `${renderedCharacters.length.toLocaleString()}/${characterCount.toLocaleString()}` : characterCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Zoom:</span>
            <span className="font-mono text-xs">{viewport.scale.toFixed(2)}x</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-secondary rounded text-[9px]">WASD</kbd> Pan
            <kbd className="ml-2 px-1 py-0.5 bg-secondary rounded text-[9px]">+/-</kbd> Zoom
            <kbd className="ml-2 px-1 py-0.5 bg-secondary rounded text-[9px]">R</kbd> Reset
          </p>
        </div>
      </div>

      {/* Performance indicator */}
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">PixiJS WebGL</span>
        </div>
      </div>
    </div>
  );
};
