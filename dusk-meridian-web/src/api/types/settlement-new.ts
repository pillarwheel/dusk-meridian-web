// Completely new settlement types file to resolve import issues

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