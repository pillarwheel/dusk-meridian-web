// Clean version of settlement types

// Basic type definitions first
export type SettlementFaction = 'player' | 'ally' | 'neutral' | 'enemy' | 'npc';
export type SettlementStatus = 'peaceful' | 'alert' | 'under_siege' | 'expanding' | 'abandoned';
export type BuildingStatus = 'active' | 'inactive' | 'under_construction' | 'upgrading' | 'damaged' | 'destroyed' | 'abandoned';

// Simple interfaces for API responses
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

// Simplified Settlement interface for now
export interface Settlement {
  id: string;
  name: string;
  faction: SettlementFaction;
  status: SettlementStatus;
  owner: string;
  founded: Date;
  lastUpdated: Date;
  publicView?: boolean;
}