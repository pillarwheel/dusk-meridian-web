// Settlement types - moved to src/types to avoid module resolution issues

export interface SettlementListItem {
  settlement_id: number;
  name: string;
  continent_id: number;
  region_id: number;
  sub_region?: string;
  settlement_type: 'City' | 'Town' | 'Village' | 'Stronghold';
  population: number;
  dominant_faction?: number;
  government_type?: string;
  trade_importance: number;
  x_coordinate: number;
  y_coordinate: number;
  z_coordinate: number;
  public_view: boolean;
}

export interface Settlement {
  id: string;
  name: string;
  status: string;
  owner: string;
  founded: Date;
  lastUpdated: Date;
  publicView?: boolean;
}

export interface SettlementPopulation {
  total: number;
  characters: Array<{
    character_id: number;
    name: string;
    level: number;
    class: string;
  }>;
}

export interface SettlementBuilding {
  building_id: number;
  settlement_id: number;
  name: string;
  type: string;
  x_coordinate: number;
  y_coordinate: number;
  z_coordinate: number;
  is_destroyed: boolean;
  is_damaged: boolean;
  capacity: number;
  isActive: boolean;
}