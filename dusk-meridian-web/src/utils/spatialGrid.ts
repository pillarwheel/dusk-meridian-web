/**
 * Spatial Grid for efficient viewport culling
 * Reduces object queries from O(n) to O(log n) by partitioning space into cells
 */

export interface GridCell {
  x: number;
  y: number;
}

export interface GridObject {
  id: number | string;
  x: number;
  y: number;
  data: any;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class SpatialGrid<T extends GridObject> {
  private cellSize: number;
  private grid: Map<string, T[]>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  /**
   * Convert world coordinates to grid cell coordinates
   */
  private worldToCell(x: number, y: number): GridCell {
    return {
      x: Math.floor(x / this.cellSize),
      y: Math.floor(y / this.cellSize),
    };
  }

  /**
   * Generate cell key for hash map
   */
  private getCellKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`;
  }

  /**
   * Insert an object into the grid
   */
  insert(obj: T): void {
    const cell = this.worldToCell(obj.x, obj.y);
    const key = this.getCellKey(cell.x, cell.y);

    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }

    this.grid.get(key)!.push(obj);
  }

  /**
   * Clear all objects from the grid
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Rebuild grid with new objects
   */
  rebuild(objects: T[]): void {
    this.clear();
    objects.forEach((obj) => this.insert(obj));
  }

  /**
   * Query objects within a bounding box (viewport)
   * Returns only objects in visible cells - massive performance gain
   */
  query(bounds: BoundingBox): T[] {
    const minCell = this.worldToCell(bounds.minX, bounds.minY);
    const maxCell = this.worldToCell(bounds.maxX, bounds.maxY);

    const results: T[] = [];

    // Only check cells that intersect the viewport
    for (let cellX = minCell.x; cellX <= maxCell.x; cellX++) {
      for (let cellY = minCell.y; cellY <= maxCell.y; cellY++) {
        const key = this.getCellKey(cellX, cellY);
        const cellObjects = this.grid.get(key);

        if (cellObjects) {
          // Filter objects that are actually within bounds
          cellObjects.forEach((obj) => {
            if (
              obj.x >= bounds.minX &&
              obj.x <= bounds.maxX &&
              obj.y >= bounds.minY &&
              obj.y <= bounds.maxY
            ) {
              results.push(obj);
            }
          });
        }
      }
    }

    return results;
  }

  /**
   * Get all objects in the grid (for debugging)
   */
  getAllObjects(): T[] {
    const allObjects: T[] = [];
    this.grid.forEach((objects) => {
      allObjects.push(...objects);
    });
    return allObjects;
  }

  /**
   * Get grid statistics (for debugging/monitoring)
   */
  getStats() {
    const cellCount = this.grid.size;
    let objectCount = 0;
    let maxObjectsPerCell = 0;
    let minObjectsPerCell = Infinity;

    this.grid.forEach((objects) => {
      objectCount += objects.length;
      maxObjectsPerCell = Math.max(maxObjectsPerCell, objects.length);
      minObjectsPerCell = Math.min(minObjectsPerCell, objects.length);
    });

    const avgObjectsPerCell = cellCount > 0 ? objectCount / cellCount : 0;

    return {
      cellSize: this.cellSize,
      cellCount,
      objectCount,
      avgObjectsPerCell: avgObjectsPerCell.toFixed(2),
      maxObjectsPerCell,
      minObjectsPerCell: cellCount > 0 ? minObjectsPerCell : 0,
    };
  }
}
